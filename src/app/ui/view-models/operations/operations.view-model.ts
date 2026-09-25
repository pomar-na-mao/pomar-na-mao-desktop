import { inject, Injectable, signal, effect } from '@angular/core';
import * as L from 'leaflet';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { OperationsRepository } from '../../../data/repositories/operations/operations-repository';
import { SprayingOperationResponse, InspectionOperationResponse, InspectionPlant, InspectionEntry } from '../../../domain/models/operations.model';
import {
  buildOrderedMapBoundary,
  type OrderedMapBoundary,
} from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];

@Injectable()
export class OperationsViewModel {
  private farmBoundaryService = inject(FarmBoundaryService);
  private operationsRepository = inject(OperationsRepository);

  public isMapFullscreen = signal(false);
  private map: L.Map | null = null;
  private geoJsonLayer: L.GeoJSON | null = null;
  private farmPolygonLayer: L.Polygon | null = null;
  private inspectionPlantLayers: L.LayerGroup | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });

  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public selectedOperation = signal<string>('');
  public selectedOperationDetails = signal<SprayingOperationResponse | null>(null);
  public selectedInspectionDetails = signal<InspectionOperationResponse | null>(null);
  public selectedInspectionPlant = signal<InspectionPlant | null>(null);
  public inspectionEntriesForPlant = signal<InspectionEntry[]>([]);
  public currentInspectionIndex = signal<number>(0);
  public farmBoundary = signal<OrderedMapBoundary | null>(null);


  constructor() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    this.startDate.set(todayStr);
    this.endDate.set(todayStr);

    effect(() => {
      const type = this.selectedOperation();
      const start = this.startDate();
      const end = this.endDate();

      if (type === 'pulverizacao') {
        this.fetchSprayingOperations(start, end);
        this.operationsRepository.inspectionOperations.set([]);
        this.operationsRepository.annotationOperations.set([]);
        this.clearInspectionSelection();
      } else if (type === 'inspecao') {
        this.fetchInspectionOperations(start, end);
        this.operationsRepository.sprayingOperations.set([]);
        this.operationsRepository.annotationOperations.set([]);
        this.selectedOperationDetails.set(null);
        this.clearInspectionSelection();
      } else if (type === 'anotacao') {
        this.fetchAnnotationOperations(start, end);
        this.operationsRepository.sprayingOperations.set([]);
        this.operationsRepository.inspectionOperations.set([]);
        this.selectedOperationDetails.set(null);
        this.clearInspectionSelection();
      } else {
        this.operationsRepository.sprayingOperations.set([]);
        this.operationsRepository.inspectionOperations.set([]);
        this.operationsRepository.annotationOperations.set([]);
        this.selectedOperationDetails.set(null);
        this.clearInspectionSelection();
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.drawOperations(this.operations());
    });

    effect(() => {
      const type = this.selectedOperation();
      if (type === 'inspecao') {
        this.drawInspectionPlants(this.inspectionOperations());
      } else if (type === 'anotacao') {
        this.drawInspectionPlants(this.annotationOperations());
      } else {
        this.drawInspectionPlants([]);
      }
    });

    effect(() => {
      this.farmBoundary();
      this.renderFarmPolygon();
    });


    void this.loadFarmBoundary();
  }

  private async fetchSprayingOperations(start: string, end: string) {
    await this.operationsRepository.getSprayingOperations(
      start || null,
      end || null,
      null
    );
  }

  private async fetchInspectionOperations(start: string, end: string) {
    await this.operationsRepository.getInspectionOperations(
      start || null,
      end || null,
      null
    );
  }

  private async fetchAnnotationOperations(start: string, end: string) {
    await this.operationsRepository.getAnnotationOperations(
      start || null,
      end || null,
      null
    );
  }

  public get operations() {
    return this.operationsRepository.sprayingOperations;
  }

  public get inspectionOperations() {
    return this.operationsRepository.inspectionOperations;
  }

  public get annotationOperations() {
    return this.operationsRepository.annotationOperations;
  }

  initMap(elementId: string): void {
    if (this.map) return;
    this.map = L.map(elementId, {
      zoomControl: false,
      attributionControl: false,
      maxZoom: 22,
    }).setView(DEFAULT_CENTER, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      maxNativeZoom: 19,
    }).addTo(this.map);

    this.farmPolygonLayer = L.polygon([], {
      interactive: false,
      color: '#2563eb',
      weight: 3,
      fillColor: '#60a5fa',
      fillOpacity: 0.08,
    }).addTo(this.map);

    this.inspectionPlantLayers = L.layerGroup().addTo(this.map);

    this.renderFarmPolygon();
    this.drawOperations(this.operations());
    this.drawInspectionPlants(this.inspectionOperations());
  }

  private drawInspectionPlants(operations: InspectionOperationResponse[]): void {
    if (!this.map || !this.inspectionPlantLayers) return;

    this.inspectionPlantLayers.clearLayers();

    if (!operations || operations.length === 0) return;

    const plantMap = new Map<string, InspectionEntry[]>();

    operations.forEach(op => {
      if (op.plants && op.plants.length > 0) {
        op.plants.forEach(plant => {
          if (!plantMap.has(plant.plant_id)) {
            plantMap.set(plant.plant_id, []);
          }
          plantMap.get(plant.plant_id)!.push({ operation: op, plant });
        });
      }
    });

    plantMap.forEach(entries => {
      entries.sort((a, b) => new Date(b.operation.started_at).getTime() - new Date(a.operation.started_at).getTime());
    });

    const bounds = L.latLngBounds([]);

    plantMap.forEach((entries) => {
      const { plant } = entries[0];
      const marker = L.circleMarker([plant.latitude, plant.longitude], {
        radius: 4.5,
        color: entries.length > 1 ? '#ea580c' : '#f59e0b',
        fillColor: entries.length > 1 ? '#c2410c' : '#d97706',
        fillOpacity: 0.9,
        weight: entries.length > 1 ? 2.5 : 1.5,
        renderer: this.plantRenderer,
      });

      marker.on('click', () => {
        this.inspectionEntriesForPlant.set(entries);
        this.currentInspectionIndex.set(0);
        this.selectedInspectionDetails.set(entries[0].operation);
        this.selectedInspectionPlant.set(entries[0].plant);
        this.selectedOperationDetails.set(null);
      });

      marker.addTo(this.inspectionPlantLayers!);
      bounds.extend([plant.latitude, plant.longitude]);
    });

    try {
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
      }
    } catch {
      // ignore fitBounds failures
    }
    this.bringFarmPolygonToFront();
  }

  private drawOperations(operations: SprayingOperationResponse[]) {
    if (!this.map) return;

    if (this.geoJsonLayer) {
      this.geoJsonLayer.remove();
      this.geoJsonLayer = null;
    }

    if (!operations || operations.length === 0) return;

    this.geoJsonLayer = L.geoJSON(undefined, {
      style: {
        color: '#f59e0b',
        weight: 4,
        opacity: 0.7
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          this.selectedOperationDetails.set(feature.properties as SprayingOperationResponse);
        });
      }
    });

    operations.forEach(op => {
      if (op.route_geojson) {
        this.geoJsonLayer!.addData({
          type: 'Feature',
          geometry: op.route_geojson,
          properties: op
        } as unknown as Parameters<L.GeoJSON['addData']>[0]);
      }
    });

    this.geoJsonLayer.addTo(this.map);

    try {
      if (operations.length > 0) {
        this.map.fitBounds(this.geoJsonLayer.getBounds());
      }
    } catch {
      // fitBounds can fail if coordinates are invalid; ignore safely
    }
    this.bringFarmPolygonToFront();
  }

  private renderFarmPolygon(): void {
    if (!this.farmPolygonLayer || !this.map) {
      return;
    }

    this.farmPolygonLayer.setLatLngs([]);

    const farmBoundary = this.farmBoundary();
    if (!farmBoundary) {
      return;
    }

    this.farmPolygonLayer.setLatLngs(farmBoundary.latLngs);
    this.bringFarmPolygonToFront();

    const farmBounds = this.getFarmBounds() ?? this.farmPolygonLayer.getBounds();
    if (farmBounds.isValid()) {
      this.map.fitBounds(farmBounds, { padding: [48, 48], maxZoom: 18 });
    }
  }

  setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
  }

  invalidateMapSize(): void {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  toggleFullscreen() {
    this.setMapFullscreen(!this.isMapFullscreen());
  }

  public navigateInspection(direction: 'prev' | 'next'): void {
    const entries = this.inspectionEntriesForPlant();
    const current = this.currentInspectionIndex();
    const newIndex = direction === 'next' ? current + 1 : current - 1;

    if (newIndex >= 0 && newIndex < entries.length) {
      this.currentInspectionIndex.set(newIndex);
      this.selectedInspectionDetails.set(entries[newIndex].operation);
      this.selectedInspectionPlant.set(entries[newIndex].plant);
    }
  }

  public clearInspectionSelection(): void {
    this.selectedInspectionDetails.set(null);
    this.selectedInspectionPlant.set(null);
    this.inspectionEntriesForPlant.set([]);
    this.currentInspectionIndex.set(0);
  }

  private async loadFarmBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      this.farmBoundary.set(buildOrderedMapBoundary(points));
    } catch (error) {
      console.error('Failed to load farm boundary for operations map', error);
      this.farmBoundary.set(null);
    }
  }

  private getFarmBounds(): L.LatLngBounds | null {
    const farmBoundary = this.farmBoundary();
    if (!farmBoundary) {
      return null;
    }

    const bounds = L.latLngBounds(farmBoundary.latLngs);
    return bounds.isValid() ? bounds : null;
  }

  private bringFarmPolygonToFront(): void {
    this.farmPolygonLayer?.bringToFront();
  }
}

import { inject, Injectable, signal, effect } from '@angular/core';
import * as L from 'leaflet';
import { OperationsRepository } from '../../../data/repositories/operations/operations-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { SprayingOperationResponse, InspectionOperationResponse, InspectionPlant, InspectionEntry } from '../../../domain/models/operations.model';
import { Plant } from '../../../domain/models/plant-data.model';

@Injectable()
export class OperationsViewModel {
  private operationsRepository = inject(OperationsRepository);
  private zonesRepository = inject(ZonesRepository);
  private plantsRepository = inject(PlantsRepository);

  public isMapFullscreen = signal(false);
  private map: L.Map | null = null;
  private geoJsonLayer: L.GeoJSON | null = null;
  private zonePolygonLayer: L.GeoJSON | null = null;
  private plantLayers: L.LayerGroup | null = null;
  private inspectionPlantLayers: L.LayerGroup | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });

  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public selectedZoneId = signal<string>('');
  public selectedOperation = signal<string>('');
  public selectedOperationDetails = signal<SprayingOperationResponse | null>(null);
  public selectedInspectionDetails = signal<InspectionOperationResponse | null>(null);
  public selectedInspectionPlant = signal<InspectionPlant | null>(null);
  public inspectionEntriesForPlant = signal<InspectionEntry[]>([]);
  public currentInspectionIndex = signal<number>(0);

  public showPlants = signal<boolean>(false);
  public zonePlants = signal<Plant[]>([]);

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
      const zone = this.selectedZoneId();

      if (type === 'pulverizacao') {
        this.fetchSprayingOperations(start, end, zone);
        this.operationsRepository.inspectionOperations.set([]);
        this.operationsRepository.annotationOperations.set([]);
        this.clearInspectionSelection();
      } else if (type === 'inspecao') {
        this.fetchInspectionOperations(start, end, zone);
        this.operationsRepository.sprayingOperations.set([]);
        this.operationsRepository.annotationOperations.set([]);
        this.selectedOperationDetails.set(null);
        this.clearInspectionSelection();
      } else if (type === 'anotacao') {
        this.fetchAnnotationOperations(start, end, zone);
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
      const zoneId = this.selectedZoneId();
      this.renderZonePolygon(zoneId);
    });

    effect(() => {
      const zoneId = this.selectedZoneId();
      if (!zoneId) {
        this.showPlants.set(false);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      const show = this.showPlants();
      const zoneId = this.selectedZoneId();

      if (show && zoneId) {
        this.fetchZonePlants(zoneId);
      } else {
        this.zonePlants.set([]);
      }
    }, { allowSignalWrites: true });

    effect(() => {
      this.renderPlants(this.zonePlants());
    });
  }

  private async fetchSprayingOperations(start: string, end: string, zone: string) {
    await this.operationsRepository.getSprayingOperations(
      start || null, 
      end || null, 
      zone || null
    );
  }

  private async fetchInspectionOperations(start: string, end: string, zone: string) {
    await this.operationsRepository.getInspectionOperations(
      start || null, 
      end || null, 
      zone || null
    );
  }

  private async fetchAnnotationOperations(start: string, end: string, zone: string) {
    await this.operationsRepository.getAnnotationOperations(
      start || null, 
      end || null, 
      zone || null
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
    }).setView([-23.403, -49.149], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      maxNativeZoom: 19,
    }).addTo(this.map);

    this.zonePolygonLayer = L.geoJSON(undefined, {
      interactive: false,
      style: {
        color: '#3b82f6', // blue
        weight: 3,
        fillColor: '#3b82f6',
        fillOpacity: 0.15,
      },
    }).addTo(this.map);

    this.plantLayers = L.layerGroup().addTo(this.map);
    this.inspectionPlantLayers = L.layerGroup().addTo(this.map);
    
    this.drawOperations(this.operations());
    this.drawInspectionPlants(this.inspectionOperations());
    this.renderZonePolygon(this.selectedZoneId());
  }

  private drawInspectionPlants(operations: InspectionOperationResponse[]): void {
    if (!this.map || !this.inspectionPlantLayers) return;

    this.inspectionPlantLayers.clearLayers();

    if (!operations || operations.length === 0) return;

    // Group by plant_id across all operations
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

    // Sort each plant's entries by date descending (newest first)
    plantMap.forEach(entries => {
      entries.sort((a, b) => new Date(b.operation.started_at).getTime() - new Date(a.operation.started_at).getTime());
    });

    const bounds = L.latLngBounds([]);

    // Create one marker per unique plant
    plantMap.forEach((entries) => {
      const { plant } = entries[0];
      const marker = L.circleMarker([plant.latitude, plant.longitude], {
        radius: 9,
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
        color: '#f59e0b', // orange
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
  }

  private renderZonePolygon(zoneId: string): void {
    if (!this.zonePolygonLayer || !this.map) {
      return;
    }

    this.zonePolygonLayer.clearLayers();

    if (!zoneId) {
      return;
    }

    const zone = this.zonesRepository.zones().find((z) => z.id === zoneId);
    if (!zone?.polygon) {
      return;
    }

    this.zonePolygonLayer.addData(zone.polygon as unknown as Parameters<L.GeoJSON['addData']>[0]);

    const polygonBounds = this.zonePolygonLayer.getBounds();
    if (polygonBounds.isValid()) {
      this.map.fitBounds(polygonBounds, { padding: [48, 48], maxZoom: 18 });
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

  private async fetchZonePlants(zoneId: string) {
    const plants = await this.plantsRepository.queryPlants({ zoneId });
    this.zonePlants.set(plants);
  }

  private renderPlants(plants: Plant[]): void {
    if (!this.map || !this.plantLayers) {
      return;
    }

    this.plantLayers.clearLayers();

    if (plants.length === 0) {
      return;
    }

    plants.forEach((plant) => {
      L.circleMarker([plant.latitude, plant.longitude], {
        radius: 9,
        color: '#34d399', // green border
        fillColor: '#10b981', // green fill
        fillOpacity: 0.9,
        weight: 0.75,
        renderer: this.plantRenderer,
      })
        .bindPopup(
          `
            <div style="font-family: sans-serif; font-size: 12px; min-width: 140px">
              ID: ${plant.id}<br/>
              ${plant.latitude.toFixed(6)}, ${plant.longitude.toFixed(6)}
            </div>
          `,
        )
        .addTo(this.plantLayers!);
    });
  }
}

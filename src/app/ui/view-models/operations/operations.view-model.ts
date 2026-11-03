import { inject, Injectable, signal, effect, computed } from '@angular/core';
import * as L from 'leaflet';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { OperationsRepository } from '../../../data/repositories/operations/operations-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import {
  SprayingOperationResponse,
  InspectionOperationResponse,
  InspectionPlant,
  InspectionEntry,
} from '../../../domain/models/operations.model';
import {
  buildOrderedMapBoundary,
  type OrderedMapBoundary,
} from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];

@Injectable()
export class OperationsViewModel {
  private farmBoundaryService = inject(FarmBoundaryService);
  private operationsRepository = inject(OperationsRepository);
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);

  public isMapFullscreen = signal(false);
  private map: L.Map | null = null;
  private geoJsonLayer: L.GeoJSON | null = null;
  private farmPolygonLayer: L.Polygon | null = null;
  private zonePolygonLayers: L.LayerGroup | null = null;
  private inspectionPlantLayers: L.LayerGroup | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });

  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public selectedOperation = signal<string>('');
  public selectedZoneId = signal<string>('');
  public selectedOperationDetails = signal<SprayingOperationResponse | null>(null);
  public selectedInspectionDetails = signal<InspectionOperationResponse | null>(null);
  public selectedInspectionPlant = signal<InspectionPlant | null>(null);
  public inspectionEntriesForPlant = signal<InspectionEntry[]>([]);
  public currentInspectionIndex = signal<number>(0);
  public farmBoundary = signal<OrderedMapBoundary | null>(null);

  public zoneOptions = computed(() => [
    { label: 'Todas as Zonas', value: '' },
    ...this.zonesRepository
      .zones()
      .map((zone) => ({ label: zone.name, value: zone.id })),
  ]);

  constructor() {
    this.startDate.set('');
    this.endDate.set('');

    effect(() => {
      const type = this.selectedOperation();
      const start = this.startDate();
      const end = this.endDate();
      const zoneId = this.selectedZoneId();

      if (type === 'pulverizacao') {
        this.fetchSprayingOperations(start, end, zoneId);
        this.operationsRepository.inspectionOperations.set([]);
        this.operationsRepository.annotationOperations.set([]);
        this.clearInspectionSelection();
      } else if (type === 'inspecao') {
        this.fetchInspectionOperations(start, end, zoneId);
        this.operationsRepository.sprayingOperations.set([]);
        this.operationsRepository.annotationOperations.set([]);
        this.selectedOperationDetails.set(null);
        this.clearInspectionSelection();
      } else if (type === 'anotacao') {
        this.fetchAnnotationOperations(start, end, zoneId);
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

    effect(() => {
      this.zonesRepository.zones();
      this.regionsRepository.regions();
      this.selectedZoneId();
      this.renderZonePolygons();
    });

    void this.loadFarmBoundary();
    void this.loadZonesAndRegions();
  }

  private async fetchSprayingOperations(start: string, end: string, zoneId: string) {
    await this.operationsRepository.getSprayingOperations(
      start || null,
      end || null,
      zoneId || null
    );
  }

  private async fetchInspectionOperations(start: string, end: string, zoneId: string) {
    await this.operationsRepository.getInspectionOperations(
      start || null,
      end || null,
      zoneId || null
    );
  }

  private async fetchAnnotationOperations(start: string, end: string, zoneId: string) {
    await this.operationsRepository.getAnnotationOperations(
      start || null,
      end || null,
      zoneId || null
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

  public onZoneChange(zoneId: string): void {
    this.selectedZoneId.set(zoneId);
    this.zoomToZone(zoneId);
  }

  public zoomToZone(zoneId: string): void {
    if (!this.map) return;

    if (!zoneId) {
      const farmBounds = this.getFarmBounds() ?? this.farmPolygonLayer?.getBounds();
      if (farmBounds && farmBounds.isValid()) {
        this.map.fitBounds(farmBounds, { padding: [48, 48], maxZoom: 18 });
      } else {
        this.map.setView(DEFAULT_CENTER, 14);
      }
      return;
    }

    const coords = this.getZoneCoordinates(zoneId);
    if (coords && coords.length >= 3) {
      const bounds = L.latLngBounds(coords);
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
      }
    }
  }

  public getZoneCoordinates(zoneId: string): [number, number][] | null {
    const regions = this.regionsRepository.regions().filter((r) => r.zone_id === zoneId);
    if (regions.length >= 3) {
      return [...regions]
        .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
        .map((r) => [r.latitude, r.longitude]);
    }

    const zone = this.zonesRepository.zones().find((z) => z.id === zoneId);
    if (zone?.polygon) {
      return this.toPolygonCoordinates(zone.polygon);
    }

    return null;
  }

  private toPolygonCoordinates(polygon: Record<string, unknown>): [number, number][] | null {
    if (!polygon || polygon['type'] !== 'Polygon') {
      return null;
    }

    const coordinates = polygon['coordinates'];
    if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0])) {
      return null;
    }

    const firstRing = coordinates[0];
    const parsedCoordinates = firstRing
      .map((point): [number, number] | null => {
        if (!Array.isArray(point) || point.length < 2) return null;

        const [longitude, latitude] = point;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          return null;
        }

        return [latitude as number, longitude as number];
      })
      .filter((point): point is [number, number] => point !== null);

    if (parsedCoordinates.length < 3) return null;

    const firstPoint = parsedCoordinates[0];
    const lastPoint = parsedCoordinates[parsedCoordinates.length - 1];
    const hasClosingPoint =
      firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1];

    return hasClosingPoint ? parsedCoordinates.slice(0, -1) : parsedCoordinates;
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

    const boundariesPane = this.map.createPane('operations-boundaries');
    boundariesPane.style.zIndex = '350';
    boundariesPane.style.pointerEvents = 'none';

    this.farmPolygonLayer = L.polygon([], {
      interactive: false,
      pane: 'operations-boundaries',
      color: '#2563eb',
      weight: 3,
      fillColor: '#60a5fa',
      fillOpacity: 0.08,
    }).addTo(this.map);

    this.zonePolygonLayers = L.layerGroup().addTo(this.map);
    this.inspectionPlantLayers = L.layerGroup().addTo(this.map);

    this.renderFarmPolygon();
    this.renderZonePolygons();
    this.drawOperations(this.operations());
    this.drawInspectionPlants(this.inspectionOperations());

    if (this.selectedZoneId()) {
      this.zoomToZone(this.selectedZoneId());
    }
  }

  private renderZonePolygons(): void {
    if (!this.map || !this.zonePolygonLayers) return;
    this.zonePolygonLayers.clearLayers();

    const selectedId = this.selectedZoneId();
    for (const zone of this.zonesRepository.zones()) {
      const coords = this.getZoneCoordinates(zone.id);
      if (!coords || coords.length < 3) continue;

      const isSelected = zone.id === selectedId;
      L.polygon(coords, {
        interactive: false,
        pane: 'operations-boundaries',
        color: isSelected ? '#10b981' : '#3b82f6',
        weight: isSelected ? 3 : 1.5,
        fillColor: isSelected ? '#10b981' : '#3b82f6',
        fillOpacity: isSelected ? 0.2 : 0.05,
      }).addTo(this.zonePolygonLayers);
    }
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
        radius: 6,
        color: entries.length > 1 ? '#ea580c' : '#f59e0b',
        fillColor: entries.length > 1 ? '#c2410c' : '#d97706',
        fillOpacity: 0.9,
        weight: entries.length > 1 ? 2.5 : 1.5,
        renderer: this.plantRenderer,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
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
        try {
          const geometry = typeof op.route_geojson === 'string'
            ? JSON.parse(op.route_geojson)
            : op.route_geojson;

          this.geoJsonLayer!.addData({
            type: 'Feature',
            geometry,
            properties: op
          } as unknown as Parameters<L.GeoJSON['addData']>[0]);
        } catch (e) {
          console.error('Failed to parse route_geojson for operation', op.operation_id, e);
        }
      }
    });

    this.geoJsonLayer.addTo(this.map);

    try {
      if (operations.length > 0 && this.geoJsonLayer.getLayers().length > 0) {
        const bounds = this.geoJsonLayer.getBounds();
        if (bounds && bounds.isValid()) {
          this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
        }
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
    const hasActiveOperations = this.operations().length > 0 || this.inspectionOperations().length > 0;
    if (farmBounds && farmBounds.isValid() && !this.selectedZoneId() && !hasActiveOperations) {
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

  public destroyMap(): void {
    this.map?.remove();
    this.map = null;
    this.geoJsonLayer = null;
    this.farmPolygonLayer = null;
    this.zonePolygonLayers = null;
    this.inspectionPlantLayers = null;
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

  public clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.selectedOperation.set('');
    this.selectedZoneId.set('');
    this.clearInspectionSelection();
    this.selectedOperationDetails.set(null);
    this.zoomToZone('');
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

  private async loadZonesAndRegions(): Promise<void> {
    try {
      await Promise.all([
        this.zonesRepository.findAll(),
        this.regionsRepository.findAll(),
      ]);
    } catch (error) {
      console.error('Failed to load zones/regions for operations map', error);
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

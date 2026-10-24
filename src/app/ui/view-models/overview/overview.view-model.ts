import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import { OverviewRepository } from '../../../data/repositories/overview/overview-repository';
import type {
  OverviewBoundaryPoint,
  OverviewOccurrence,
  OverviewPlant,
  OverviewSnapshotFilters,
  OverviewSummary,
  OverviewVariety,
  OverviewZone,
} from '../../../domain/models/overview.model';
import { LoadingService } from '../../../shared/services/loading.service';
import {
  buildOrderedMapBoundary,
  type OrderedMapBoundary,
} from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];
const LIVING_PLANT_COLOR = '#10b981';
const LIVING_PLANT_STROKE_COLOR = '#047857';
const DEAD_PLANT_COLOR = '#ef4444';
const DEAD_PLANT_STROKE_COLOR = '#b91c1c';

export interface OverviewPlantStatusPresentation {
  label: 'Viva' | 'Morta';
  color: string;
  strokeColor: string;
}

@Injectable()
export class OverviewViewModel {
  private overviewRepository = inject(OverviewRepository);
  private loadingService = inject(LoadingService);
  private supportDataLoaded = signal(false);
  private snapshotRequestId = 0;
  private snapshotLoadingVisible = false;

  private map: L.Map | null = null;
  private plantLayers: L.LayerGroup | null = null;
  private zonePolygonLayer: L.GeoJSON | null = null;
  private farmPolygonLayer: L.Polygon | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });
  private zoneBoundaryCache = new Map<string, OrderedMapBoundary | null>();
  private zoneBoundaryRequestId = 0;

  public isMapFullscreen = signal(false);
  public summary = signal<OverviewSummary | null>(null);
  public mapPlants = signal<OverviewPlant[]>([]);
  public farmBoundary = signal<OrderedMapBoundary | null>(null);
  public selectedZoneBoundary = signal<OrderedMapBoundary | null>(null);

  // --- Filter state ---
  public filterPlantingStartDate = signal('');
  public filterPlantingEndDate = signal('');
  public filterZoneId = signal('');
  public filterOccurrenceId = signal('');
  public filterVarietyId = signal('');
  public filterPlantStatus = signal('');

  // --- Filter options (loaded from DB) ---
  public availableZones = signal<OverviewZone[]>([]);
  public availableOccurrences = signal<OverviewOccurrence[]>([]);
  public openOccurrences = signal<
    Array<{ plant_id: string; occurrence_type_id: string }>
  >([]);

  public availableVarieties = computed<OverviewVariety[]>(() => {
    const summary = this.summary();
    return summary?.varieties ?? [];
  });

  public filteredPlants = computed<OverviewPlant[]>(() => {
    let plants = this.mapPlants();

    // 1. Filter by Variety
    const varietyId = this.filterVarietyId();
    if (varietyId === 'none') {
      plants = plants.filter(
        (plant) =>
          !plant.nonExistent && (plant.varietyId === null || !plant.varietyName),
      );
    } else if (varietyId) {
      const varietyIdNum = Number(varietyId);
      plants = plants.filter(
        (plant) => !plant.nonExistent && plant.varietyId === varietyIdNum,
      );
    }

    // 2. Filter by Plant Status (Planta viva vs morta)
    const plantStatus = this.filterPlantStatus();
    if (plantStatus === 'alive') {
      plants = plants.filter((plant) => !plant.isDead);
    } else if (plantStatus === 'dead') {
      plants = plants.filter((plant) => plant.isDead);
    }

    // 2. Filter by Zone
    const zoneId = this.filterZoneId();
    if (zoneId) {
      const boundary = this.selectedZoneBoundary();
      if (boundary) {
        plants = plants.filter((plant) =>
          isPointInPolygon(plant.latitude, plant.longitude, boundary.geoJson),
        );
      }
    }

    // 3. Filter by Occurrence
    const occurrenceId = this.filterOccurrenceId();
    if (occurrenceId) {
      const matchingPlantIds = new Set(
        this.openOccurrences()
          .filter((oc) => oc.occurrence_type_id === occurrenceId)
          .map((oc) => oc.plant_id),
      );
      plants = plants.filter((plant) => matchingPlantIds.has(plant.id));
    }

    return plants;
  });

  public plottedPlantsCount = computed(() => this.filteredPlants().length);
  public snapshotFilters = computed<OverviewSnapshotFilters>(() => {
    const plantingStartDate = this.normalizeDateFilter(
      this.filterPlantingStartDate(),
    );
    const plantingEndDate = this.normalizeDateFilter(
      this.filterPlantingEndDate(),
    );

    return {
      plantingStartDate,
      plantingEndDate,
    };
  });

  constructor() {
    effect(() => {
      this.filteredPlants();
      this.renderPlants();
    });

    effect(() => {
      const zoneId = this.filterZoneId();
      void this.loadSelectedZoneBoundary(zoneId);
    });

    effect(() => {
      this.farmBoundary();
      this.renderFarmPolygon();
    });

    effect(() => {
      this.selectedZoneBoundary();
      this.renderZonePolygon();
    });

    effect(() => {
      if (!this.supportDataLoaded()) {
        return;
      }

      const filters = this.snapshotFilters();
      void this.loadSnapshot(filters);
    });

    void this.loadSupportData();
  }

  public async loadOverview(): Promise<void> {
    await this.loadSupportData();
    await this.loadSnapshot(this.snapshotFilters());
  }

  public initMap(elementId: string): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(elementId, { maxZoom: 22, preferCanvas: true }).setView(
      DEFAULT_CENTER,
      16,
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 22,
      maxNativeZoom: 19,
    }).addTo(this.map);

    this.plantLayers = L.layerGroup().addTo(this.map);
    this.zonePolygonLayer = L.geoJSON(undefined, {
      style: {
        color: '#06b6d4',
        weight: 3,
        fillColor: '#06b6d4',
        fillOpacity: 0.12,
        dashArray: '6 4',
      },
    }).addTo(this.map);
    this.farmPolygonLayer = L.polygon([], {
      color: '#2563eb',
      weight: 3,
      fillColor: '#60a5fa',
      fillOpacity: 0.08,
    }).addTo(this.map);

    this.renderFarmPolygon();
    this.renderPlants();
    this.renderZonePolygon();
  }

  public invalidateMapSize(): void {
    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 300);
    }
  }

  public setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
  }

  public getPlantStatusPresentation(
    plant: OverviewPlant,
  ): OverviewPlantStatusPresentation {
    return plant.isDead
      ? {
          label: 'Morta',
          color: DEAD_PLANT_COLOR,
          strokeColor: DEAD_PLANT_STROKE_COLOR,
        }
      : {
          label: 'Viva',
          color: LIVING_PLANT_COLOR,
          strokeColor: LIVING_PLANT_STROKE_COLOR,
        };
  }

  private renderPlants(): void {
    const map = this.map;
    const plantLayers = this.plantLayers;

    if (!map || !plantLayers) {
      return;
    }

    plantLayers.clearLayers();

    const plants = this.filteredPlants();
    if (plants.length === 0) {
      if (!this.fitSelectedZoneBounds()) {
        const farmBounds = this.getFarmBounds();
        if (farmBounds) {
          map.fitBounds(farmBounds, { padding: [48, 48], maxZoom: 18 });
        } else {
          map.setView(DEFAULT_CENTER, 16);
        }
      }
      this.bringFarmPolygonToFront();
      return;
    }

    const occurrenceId = this.filterOccurrenceId();

    plants.forEach((plant) => {
      const status = this.getPlantStatusPresentation(plant);
      const plantColor = status.color;
      let strokeColor = status.strokeColor;
      let radius = 4.5;
      let weight = 0.75;
      let fillOpacity = 0.9;

      if (occurrenceId) {
        // Highlight the occurrence without replacing the plant status color.
        strokeColor = '#ffffff';
        radius = 9;
        weight = 1.5;
        fillOpacity = 1.0;
      }

      const popupTitle = plant.varietyName ?? 'Sem variedade';
      const popupRegistration = plant.nonExistent
        ? '<span style="color: #64748b">Cadastro: Pé inexistente</span><br/>'
        : '';

      L.circleMarker([plant.latitude, plant.longitude], {
        radius,
        color: strokeColor,
        fillColor: plantColor,
        fillOpacity,
        weight,
        renderer: this.plantRenderer,
      })
        .bindPopup(
          `
            <div style="font-family: sans-serif; font-size: 12px; min-width: 160px">
              <strong>${popupTitle}</strong><br/>
              Status: <strong>${status.label}</strong><br/>
              ${popupRegistration}
              ID: ${plant.id}<br/>
              ${plant.latitude.toFixed(6)}, ${plant.longitude.toFixed(6)}
            </div>
          `,
        )
        .addTo(plantLayers);
    });

    const plantBounds = L.latLngBounds(
      plants.map(
        (plant) => [plant.latitude, plant.longitude] as [number, number],
      ),
    );
    const bounds = this.filterZoneId()
      ? this.getSelectedZoneBounds() ?? plantBounds
      : this.getFarmBounds() ?? plantBounds;

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
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

    if (!this.filterZoneId() && this.filteredPlants().length === 0) {
      const bounds = this.getFarmBounds() ?? this.farmPolygonLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
      }
    }
  }

  private renderZonePolygon(): void {
    if (!this.zonePolygonLayer || !this.map) {
      return;
    }

    this.zonePolygonLayer.clearLayers();

    const boundary = this.selectedZoneBoundary();
    if (!boundary) {
      return;
    }

    this.zonePolygonLayer.addData(boundary.geoJson);
    this.fitSelectedZoneBounds();
    this.bringFarmPolygonToFront();
  }

  private async loadSupportData(): Promise<void> {
    if (this.supportDataLoaded()) {
      return;
    }

    try {
      const [filterOptions, openOccs] = await Promise.all([
        this.overviewRepository.getFilterOptions(),
        this.overviewRepository.getOpenOccurrences(),
      ]);

      this.availableZones.set(filterOptions.zones);
      this.availableOccurrences.set(filterOptions.occurrences);
      this.openOccurrences.set(openOccs);
    } catch (error) {
      console.error('Failed to load overview support data', error);
      this.availableZones.set([]);
      this.availableOccurrences.set([]);
      this.openOccurrences.set([]);
    } finally {
      this.supportDataLoaded.set(true);
    }
  }

  private async loadSelectedZoneBoundary(zoneId: string): Promise<void> {
    const requestId = ++this.zoneBoundaryRequestId;

    if (!zoneId) {
      this.selectedZoneBoundary.set(null);
      return;
    }

    if (this.zoneBoundaryCache.has(zoneId)) {
      this.selectedZoneBoundary.set(this.zoneBoundaryCache.get(zoneId) ?? null);
      return;
    }

    try {
      const regions = await this.overviewRepository.getZoneRegions(zoneId);
      const boundary = buildOrderedMapBoundary(regions);
      this.zoneBoundaryCache.set(zoneId, boundary);

      if (requestId === this.zoneBoundaryRequestId) {
        this.selectedZoneBoundary.set(boundary);
      }
    } catch (error) {
      console.error('Failed to load selected zone boundary', error);

      if (requestId === this.zoneBoundaryRequestId) {
        this.selectedZoneBoundary.set(null);
      }
    }
  }

  private async loadSnapshot(
    filters: OverviewSnapshotFilters,
  ): Promise<void> {
    const requestId = ++this.snapshotRequestId;

    try {
      const snapshot = await this.overviewRepository.getOverviewData(
        filters,
        () => {
          if (!this.snapshotLoadingVisible) {
            this.loadingService.show('Carregando dados...');
            this.snapshotLoadingVisible = true;
          }
        },
      );

      if (requestId !== this.snapshotRequestId) {
        return;
      }

      this.summary.set(snapshot.summary);
      this.farmBoundary.set(this.buildBoundary(snapshot.farmBoundary));
      this.mapPlants.set(snapshot.plants);
    } catch (error) {
      if (requestId !== this.snapshotRequestId) {
        return;
      }

      console.error('Failed to load overview snapshot', error);
      this.summary.set({
        totalPlants: 0,
        totalZones: 0,
        totalOccurrenceTypes: 0,
        totalVarieties: 0,
        varieties: [],
      });
      this.farmBoundary.set(null);
      this.mapPlants.set([]);
    } finally {
      if (requestId === this.snapshotRequestId && this.snapshotLoadingVisible) {
        this.loadingService.hide();
        this.snapshotLoadingVisible = false;
      }
    }
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  private normalizeDateFilter(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private buildBoundary(
    points: OverviewBoundaryPoint[],
  ): OrderedMapBoundary | null {
    return buildOrderedMapBoundary(points);
  }

  private fitSelectedZoneBounds(): boolean {
    const bounds = this.getSelectedZoneBounds();
    if (!this.map || !bounds) {
      return false;
    }

    this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
    return true;
  }

  private getSelectedZoneBounds(): L.LatLngBounds | null {
    if (!this.filterZoneId()) {
      return null;
    }

    const boundary = this.selectedZoneBoundary();
    if (!boundary) {
      return null;
    }

    const bounds = L.latLngBounds(boundary.latLngs);
    return bounds.isValid() ? bounds : null;
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

function isPointInPolygon(
  lat: number,
  lng: number,
  geom: GeoJSON.Geometry,
): boolean {
  if (geom.type === 'Polygon') {
    return isPointInCoords([lng, lat], (geom as GeoJSON.Polygon).coordinates);
  } else if (geom.type === 'MultiPolygon') {
    return (geom as GeoJSON.MultiPolygon).coordinates.some((polygonCoords) =>
      isPointInCoords([lng, lat], polygonCoords),
    );
  }
  return false;
}

function isPointInCoords(
  point: [number, number],
  coordinates: number[][][],
): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;

  const ring = coordinates[0];
  if (!ring || ring.length < 3) return false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

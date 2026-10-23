import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import * as L from 'leaflet';
import { MipdRepository } from '../../../data/repositories/mipd/mipd-repository';
import { OccurrenceTypesRepository } from '../../../data/repositories/occurrence-types/occurrence-types.repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { Region } from '../../../domain/models/regions.model';
import type { Zone } from '../../../domain/models/zone.model';
import type {
  MipdMarking,
  MipdPlantMarkings,
} from '../../../domain/models/mipd.model';
import {
  buildOrderedMapBoundary,
  type OrderedMapBoundary,
} from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];
const ZONE_POLYGON_COLORS = [
  '#0ea5e9',
  '#22c55e',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
];

interface MipdZonePolygon {
  id: string;
  name: string;
  color: string;
  coordinates: [number, number][];
}

@Injectable()
export class MipdViewModel {
  private mipdRepository = inject(MipdRepository);
  private occurrenceTypesRepository = inject(OccurrenceTypesRepository);
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);
  private farmBoundaryService = inject(FarmBoundaryService);

  private map: L.Map | null = null;
  private farmPolygonLayer: L.Polygon | null = null;
  private zonePolygonLayers: L.LayerGroup | null = null;
  private plantLayers: L.LayerGroup | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });
  private photoRequestId = 0;

  public isMapFullscreen = signal(false);
  public startDate = signal(this.today());
  public endDate = signal(this.today());
  public selectedZoneId = signal('');
  public selectedOccurrenceTypeId = signal('');
  public farmBoundary = signal<OrderedMapBoundary | null>(null);
  public selectedPlantMarkings = signal<MipdMarking[]>([]);
  public currentMarkingIndex = signal(0);
  public selectedMarking = signal<MipdMarking | null>(null);
  public signedPhotoUrl = signal<string | null>(null);
  public isPhotoLoading = signal(false);
  public photoError = signal<string | null>(null);

  public zonePolygons = computed<MipdZonePolygon[]>(() => {
    const regionPolygons = this.buildRegionPolygonsByZone(
      this.regionsRepository.regions(),
    );

    return this.zonesRepository
      .zones()
      .map((zone, index) => {
        const coordinates =
          regionPolygons.get(zone.id) ?? this.toPolygonCoordinates(zone);
        if (!coordinates) return null;

        return {
          id: zone.id,
          name: zone.name,
          color: ZONE_POLYGON_COLORS[index % ZONE_POLYGON_COLORS.length],
          coordinates,
        };
      })
      .filter((zone): zone is MipdZonePolygon => zone !== null);
  });

  public occurrenceTypeOptions = computed(() => [
    { label: 'Todos', value: '' },
    ...this.occurrenceTypesRepository
      .occurrenceTypes()
      .filter((item) => item.category === 'PEST_DISEASE')
      .sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'))
      .map((item) => ({ label: item.name, value: item.id })),
  ]);

  public zoneOptions = computed(() => [
    { label: 'Todas as zonas', value: '' },
    ...this.zonesRepository
      .zones()
      .map((zone) => ({ label: zone.name, value: zone.id })),
  ]);

  public markings = this.mipdRepository.markings;
  public isLoading = this.mipdRepository.isLoading;
  public errorMessage = this.mipdRepository.errorMessage;
  public dateRangeInvalid = computed(
    () =>
      Boolean(this.startDate() && this.endDate()) &&
      this.startDate() > this.endDate(),
  );
  public hasActiveFilters = computed(
    () =>
      Boolean(this.startDate() && this.endDate()) && !this.dateRangeInvalid(),
  );
  public showEmptyState = computed(
    () =>
      this.hasActiveFilters() &&
      !this.isLoading() &&
      !this.errorMessage() &&
      this.markings().length === 0,
  );

  constructor() {
    if (this.occurrenceTypesRepository.occurrenceTypes().length === 0) {
      void this.occurrenceTypesRepository.findAll();
    }

    effect(() => {
      const startDate = this.startDate();
      const endDate = this.endDate();
      const occurrenceTypeId = this.selectedOccurrenceTypeId();
      const zoneId = this.selectedZoneId();
      this.clearSelection();

      if (
        !startDate ||
        !endDate ||
        startDate > endDate
      ) {
        this.mipdRepository.clear();
        return;
      }

      void this.mipdRepository.findMarkings(
        startDate,
        endDate,
        occurrenceTypeId || null,
        zoneId || null,
      );
    });

    effect(() => {
      this.drawPlantMarkers(this.groupMarkings(this.markings()));
    });

    effect(() => {
      this.farmBoundary();
      this.renderFarmPolygon();
    });

    effect(() => {
      this.zonePolygons();
      this.renderZonePolygons();
    });

    effect(() => {
      const selectedZoneId = this.selectedZoneId();
      this.zonePolygons();
      this.fitVisibleContent(
        selectedZoneId ? [] : this.groupMarkings(this.markings()),
      );
    });

    void this.loadFarmBoundary();
    void this.loadZonePolygons();
  }

  public initMap(elementId: string): void {
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

    const boundariesPane = this.map.createPane('mipd-boundaries');
    boundariesPane.style.zIndex = '350';
    boundariesPane.style.pointerEvents = 'none';

    this.farmPolygonLayer = L.polygon([], {
      interactive: false,
      pane: 'mipd-boundaries',
      color: '#2563eb',
      weight: 4,
      fillColor: '#60a5fa',
      fillOpacity: 0.04,
    }).addTo(this.map);
    this.zonePolygonLayers = L.layerGroup().addTo(this.map);
    this.plantLayers = L.layerGroup().addTo(this.map);

    this.renderFarmPolygon();
    this.renderZonePolygons();
    this.drawPlantMarkers(this.groupMarkings(this.markings()));
  }

  public destroyMap(): void {
    this.map?.remove();
    this.map = null;
    this.farmPolygonLayer = null;
    this.zonePolygonLayers = null;
    this.plantLayers = null;
  }

  public groupMarkings(markings: MipdMarking[]): MipdPlantMarkings[] {
    const grouped = new Map<string, MipdPlantMarkings>();

    for (const marking of markings) {
      const existing = grouped.get(marking.plant_id);
      if (existing) {
        existing.markings.push(marking);
      } else {
        grouped.set(marking.plant_id, {
          plantId: marking.plant_id,
          latitude: marking.latitude,
          longitude: marking.longitude,
          markings: [marking],
        });
      }
    }

    return [...grouped.values()].map((plant) => ({
      ...plant,
      markings: [...plant.markings].sort(
        (left, right) =>
          new Date(right.observed_at).getTime() -
          new Date(left.observed_at).getTime(),
      ),
    }));
  }

  public selectPlantMarkings(markings: MipdMarking[]): void {
    const ordered = [...markings].sort(
      (left, right) =>
        new Date(right.observed_at).getTime() -
        new Date(left.observed_at).getTime(),
    );
    this.selectedPlantMarkings.set(ordered);
    this.currentMarkingIndex.set(0);
    this.selectMarking(ordered[0] ?? null);
  }

  public navigateMarking(direction: 'prev' | 'next'): void {
    const markings = this.selectedPlantMarkings();
    const current = this.currentMarkingIndex();
    const next = direction === 'next' ? current + 1 : current - 1;
    if (next < 0 || next >= markings.length) return;

    this.currentMarkingIndex.set(next);
    this.selectMarking(markings[next]);
  }

  public clearSelection(): void {
    ++this.photoRequestId;
    this.selectedPlantMarkings.set([]);
    this.currentMarkingIndex.set(0);
    this.selectedMarking.set(null);
    this.signedPhotoUrl.set(null);
    this.isPhotoLoading.set(false);
    this.photoError.set(null);
  }

  public clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.selectedZoneId.set('');
    this.selectedOccurrenceTypeId.set('');
    this.clearSelection();
    this.mipdRepository.clear();
  }

  public setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
  }

  public invalidateMapSize(): void {
    this.map?.invalidateSize();
  }

  private selectMarking(marking: MipdMarking | null): void {
    this.selectedMarking.set(marking);
    this.signedPhotoUrl.set(null);
    this.photoError.set(null);
    void this.loadSelectedPhoto(marking);
  }

  private async loadSelectedPhoto(marking: MipdMarking | null): Promise<void> {
    const requestId = ++this.photoRequestId;
    if (!marking?.photo_object_path) {
      this.isPhotoLoading.set(false);
      return;
    }

    this.isPhotoLoading.set(true);
    const result = await this.mipdRepository.createSignedPhotoUrl(
      marking.photo_object_path,
    );
    if (
      requestId !== this.photoRequestId ||
      this.selectedMarking()?.marking_id !== marking.marking_id
    ) {
      return;
    }

    this.isPhotoLoading.set(false);
    if (result.error || !result.signedUrl) {
      this.photoError.set('Não foi possível carregar a foto desta marcação.');
      return;
    }
    this.signedPhotoUrl.set(result.signedUrl);
  }

  private drawPlantMarkers(plants: MipdPlantMarkings[]): void {
    if (!this.map || !this.plantLayers) return;
    this.plantLayers.clearLayers();
    if (plants.length === 0) {
      this.fitVisibleContent();
      return;
    }

    for (const plant of plants) {
      const repeated = plant.markings.length > 1;
      const marker = L.circleMarker([plant.latitude, plant.longitude], {
        radius: 5,
        color: repeated ? '#b91c1c' : '#dc2626',
        fillColor: repeated ? '#dc2626' : '#ef4444',
        fillOpacity: 0.9,
        weight: repeated ? 2.5 : 1.5,
        renderer: this.plantRenderer,
      });
      marker.on('click', () => this.selectPlantMarkings(plant.markings));
      marker.addTo(this.plantLayers);
    }

    this.fitVisibleContent(plants);
  }

  private async loadFarmBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      this.farmBoundary.set(buildOrderedMapBoundary(points));
    } catch {
      this.farmBoundary.set(null);
    }
  }

  private async loadZonePolygons(): Promise<void> {
    await Promise.all([
      this.zonesRepository.findAll(),
      this.regionsRepository.findAll(),
    ]);
  }

  private renderFarmPolygon(): void {
    if (!this.map || !this.farmPolygonLayer) return;
    this.farmPolygonLayer.setLatLngs([]);
    const boundary = this.farmBoundary();
    if (!boundary) return;
    this.farmPolygonLayer.setLatLngs(boundary.latLngs);
    this.fitVisibleContent(this.groupMarkings(this.markings()));
  }

  private renderZonePolygons(): void {
    if (!this.map || !this.zonePolygonLayers) return;
    this.zonePolygonLayers.clearLayers();

    for (const zone of this.zonePolygons()) {
      L.polygon(zone.coordinates, {
        interactive: false,
        pane: 'mipd-boundaries',
        color: zone.color,
        weight: 2.5,
        fillColor: zone.color,
        fillOpacity: 0.16,
      }).addTo(this.zonePolygonLayers);
    }

    this.fitVisibleContent(this.groupMarkings(this.markings()));
  }

  private fitVisibleContent(plants: MipdPlantMarkings[] = []): void {
    if (!this.map) return;

    const bounds = L.latLngBounds([]);
    const selectedZone = this.zonePolygons().find(
      (zone) => zone.id === this.selectedZoneId(),
    );

    if (selectedZone) {
      selectedZone.coordinates.forEach((coordinate) =>
        bounds.extend(coordinate),
      );
    } else {
      this.farmBoundary()?.latLngs.forEach((coordinate) =>
        bounds.extend(coordinate),
      );
      this.zonePolygons().forEach((zone) =>
        zone.coordinates.forEach((coordinate) => bounds.extend(coordinate)),
      );
    }

    plants.forEach((plant) =>
      bounds.extend([plant.latitude, plant.longitude]),
    );

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
    }
  }

  private buildRegionPolygonsByZone(
    regions: Region[],
  ): Map<string, [number, number][]> {
    const grouped = new Map<string, Region[]>();
    for (const region of regions) {
      if (
        !region.zone_id ||
        !Number.isFinite(region.latitude) ||
        !Number.isFinite(region.longitude) ||
        !Number.isFinite(Number(region.order))
      ) {
        continue;
      }
      grouped.set(region.zone_id, [
        ...(grouped.get(region.zone_id) ?? []),
        region,
      ]);
    }

    const polygons = new Map<string, [number, number][]>();
    grouped.forEach((points, zoneId) => {
      if (points.length < 3) return;
      polygons.set(
        zoneId,
        [...points]
          .sort((left, right) => Number(left.order) - Number(right.order))
          .map((point) => [point.latitude, point.longitude]),
      );
    });
    return polygons;
  }

  private toPolygonCoordinates(zone: Zone): [number, number][] | null {
    if (!zone.polygon || zone.polygon['type'] !== 'Polygon') return null;
    const coordinates = zone.polygon['coordinates'];
    if (!Array.isArray(coordinates) || !Array.isArray(coordinates[0])) {
      return null;
    }

    const parsed = coordinates[0]
      .map((point): [number, number] | null => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const [longitude, latitude] = point;
        return Number.isFinite(latitude) && Number.isFinite(longitude)
          ? [latitude as number, longitude as number]
          : null;
      })
      .filter((point): point is [number, number] => point !== null);
    if (parsed.length < 3) return null;

    const first = parsed[0];
    const last = parsed[parsed.length - 1];
    return first[0] === last[0] && first[1] === last[1]
      ? parsed.slice(0, -1)
      : parsed;
  }

  private today(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

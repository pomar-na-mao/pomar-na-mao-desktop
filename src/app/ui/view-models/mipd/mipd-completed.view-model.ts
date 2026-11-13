import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import { MessageService } from 'primeng/api';
import { MipdRepository } from '../../../data/repositories/mipd/mipd.repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { MipdOperationItem } from '../../../domain/models/mipd-operation.model';
import {
  buildOrderedMapBoundary,
  type OrderedMapBoundary,
} from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];

@Injectable()
export class MipdCompletedViewModel {
  private repository = inject(MipdRepository);
  private farmBoundaryService = inject(FarmBoundaryService);
  private messageService = inject(MessageService);

  public operations = this.repository.operations;
  public zones = this.repository.zones;
  public occurrenceTypes = this.repository.occurrenceTypes;

  public isLoading = signal(false);
  public loadFailed = signal(false);

  public globalFilter = signal<string>('');
  public selectedZoneId = signal<string>('');
  public selectedOccurrenceTypeId = signal<string>('');
  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public viewMode = signal<'table' | 'map'>('table');

  public selectedItem = signal<MipdOperationItem | null>(null);
  public detailsDialogVisible = signal<boolean>(false);
  public isMapFullscreen = signal<boolean>(false);

  public photoUrl = signal<string | null>(null);
  public photoLoading = signal<boolean>(false);
  public photoError = signal<string | null>(null);

  public farmBoundary = signal<OrderedMapBoundary | null>(null);

  private map: L.Map | null = null;
  private farmPolygonLayer: L.Polygon | null = null;
  private markersLayerGroup: L.LayerGroup | null = null;

  private miniMap: L.Map | null = null;
  private miniMapMarker: L.CircleMarker | null = null;

  public totalCount = computed(() => this.operations().length);
  public withPhotoCount = computed(
    () => this.operations().filter((o) => !!o.photo_object_path).length,
  );
  public uniquePlantsCount = computed(
    () => new Set(this.operations().map((o) => o.plant_id)).size,
  );

  public hasActiveFilters = computed(() => {
    const hasQuery = this.globalFilter().trim().length > 0;
    const hasZone = this.selectedZoneId().trim().length > 0;
    const hasOcc = this.selectedOccurrenceTypeId().trim().length > 0;
    const hasDates = this.startDate().trim().length > 0 || this.endDate().trim().length > 0;
    return hasQuery || hasZone || hasOcc || hasDates;
  });

  public filteredOperations = computed(() => {
    const list = this.operations();
    const zoneId = this.selectedZoneId();
    const occId = this.selectedOccurrenceTypeId();
    const query = this.globalFilter().trim().toLowerCase();

    return list.filter((item) => {
      if (zoneId) {
        const zoneMatch = item.zone_name?.toLowerCase().includes(zoneId.toLowerCase());
        if (!zoneMatch) return false;
      }

      if (occId && item.occurrence_type_id !== occId) {
        return false;
      }

      if (!query) {
        return true;
      }

      const matchOcc = item.occurrence_type_name.toLowerCase().includes(query);
      const matchZone = item.zone_name?.toLowerCase().includes(query) ?? false;
      const matchPlant = item.plant_id.toLowerCase().includes(query);
      const matchParts = item.plant_parts.some((p) => p.toLowerCase().includes(query));

      return matchOcc || matchZone || matchPlant || matchParts;
    });
  });

  constructor() {
    effect(() => {
      const items = this.filteredOperations();
      if (this.map && this.markersLayerGroup) {
        this.drawMarkers(items);
      }
    });

    effect(() => {
      const boundary = this.farmBoundary();
      if (this.map && this.farmPolygonLayer && boundary) {
        this.renderFarmPolygon();
      }
    });
  }

  public async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.loadFailed.set(false);

    try {
      await Promise.all([
        this.repository.loadZones(),
        this.repository.loadOccurrenceTypes(),
        this.fetchBoundary(),
        this.fetchData(),
      ]);
    } catch {
      this.loadFailed.set(true);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao carregar registros de MIPD.',
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  public async fetchData(): Promise<void> {
    const { error } = await this.repository.findAll({
      startDate: this.startDate() || null,
      endDate: this.endDate() || null,
      zoneId: this.selectedZoneId() || null,
      occurrenceTypeId: this.selectedOccurrenceTypeId() || null,
    });

    if (error) {
      this.loadFailed.set(true);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao buscar registros de MIPD.',
      });
    }
  }

  private async fetchBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      if (points.length >= 3) {
        this.farmBoundary.set(buildOrderedMapBoundary(points));
      }
    } catch {
      // Ignora erro se não houver demarcação
    }
  }

  public async filterByDates(): Promise<void> {
    await this.fetchData();
  }

  public clearFilters(): void {
    this.globalFilter.set('');
    this.selectedZoneId.set('');
    this.selectedOccurrenceTypeId.set('');
    this.startDate.set('');
    this.endDate.set('');
    void this.fetchData();
  }

  public async openDetails(item: MipdOperationItem): Promise<void> {
    this.selectedItem.set(item);
    this.detailsDialogVisible.set(true);
    this.photoUrl.set(null);
    this.photoError.set(null);

    if (item.photo_object_path) {
      this.photoLoading.set(true);
      try {
        const url = await this.repository.getSignedPhotoUrl(item.photo_object_path);
        if (url) {
          this.photoUrl.set(url);
        } else {
          this.photoError.set('Foto não encontrada ou expirada.');
        }
      } catch {
        this.photoError.set('Não foi possível gerar link da foto.');
      } finally {
        this.photoLoading.set(false);
      }
    }
  }

  public closeDetails(): void {
    this.detailsDialogVisible.set(false);
    this.selectedItem.set(null);
    this.photoUrl.set(null);
    this.photoError.set(null);
    this.destroyMiniMap();
  }

  public initMap(elementId: string): void {
    if (this.map) return;

    this.map = L.map(elementId, {
      zoomControl: true,
      attributionControl: false,
      maxZoom: 22,
    }).setView(DEFAULT_CENTER, 15);

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 22,
        maxNativeZoom: 18,
        attribution: 'Esri World Imagery',
      },
    ).addTo(this.map);

    this.farmPolygonLayer = L.polygon([], {
      interactive: false,
      color: '#ffffff',
      weight: 2,
      fill: false,
      fillOpacity: 0,
      dashArray: '4, 4',
    }).addTo(this.map);

    this.markersLayerGroup = L.layerGroup().addTo(this.map);

    this.renderFarmPolygon();
    this.drawMarkers(this.filteredOperations());
  }

  public invalidateMapSize(): void {
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 200);
  }

  public destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.farmPolygonLayer = null;
      this.markersLayerGroup = null;
    }
  }

  public initMiniMap(elementId: string, item: MipdOperationItem): void {
    this.destroyMiniMap();

    setTimeout(() => {
      const container = document.getElementById(elementId);
      if (!container) return;

      this.miniMap = L.map(elementId, {
        zoomControl: false,
        attributionControl: false,
        maxZoom: 22,
      }).setView([item.latitude, item.longitude], 17);

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 22,
          maxNativeZoom: 18,
          attribution: 'Esri World Imagery',
        },
      ).addTo(this.miniMap);

      this.miniMapMarker = L.circleMarker([item.latitude, item.longitude], {
        radius: 8,
        fillColor: '#a855f7',
        color: '#ffffff',
        weight: 2.5,
        fillOpacity: 0.9,
      }).addTo(this.miniMap);
    }, 150);
  }

  public destroyMiniMap(): void {
    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = null;
      this.miniMapMarker = null;
    }
  }

  private renderFarmPolygon(): void {
    const boundary = this.farmBoundary();
    if (!this.map || !this.farmPolygonLayer || !boundary || boundary.latLngs.length < 3) return;

    this.farmPolygonLayer.setLatLngs(boundary.latLngs as L.LatLngTuple[]);
    this.map.fitBounds(this.farmPolygonLayer.getBounds(), { padding: [20, 20] });
  }

  public drawMarkers(items: MipdOperationItem[]): void {
    if (!this.map || !this.markersLayerGroup) return;

    this.markersLayerGroup.clearLayers();
    if (items.length === 0) return;

    const bounds = L.latLngBounds([]);

    for (const item of items) {
      const latLng: L.LatLngTuple = [item.latitude, item.longitude];
      bounds.extend(latLng);

      const marker = L.circleMarker(latLng, {
        radius: 7,
        fillColor: '#a855f7',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.85,
      });

      marker.bindTooltip(
        `<strong>${item.occurrence_type_name}</strong><br/>Talhão: ${item.zone_name || 'N/A'}<br/>Data: ${new Date(item.observed_at).toLocaleDateString()}`,
        { direction: 'top' },
      );

      marker.on('click', () => {
        void this.openDetails(item);
      });

      marker.addTo(this.markersLayerGroup);
    }

    if (items.length > 0 && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    }
  }

  public zoomToFarm(): void {
    if (!this.map || !this.farmPolygonLayer) return;
    const bounds = this.farmPolygonLayer.getBounds();
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [30, 30] });
    }
  }
}

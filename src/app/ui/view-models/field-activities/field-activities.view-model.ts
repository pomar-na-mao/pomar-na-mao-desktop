import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import { MessageService } from 'primeng/api';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { FieldActivitiesRepository } from '../../../data/repositories/field-activities/field-activities.repository';
import type { FieldActivityItem } from '../../../domain/models/field-activity.model';
import {
  buildOrderedMapBoundary,
  type OrderedMapBoundary,
} from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];

export interface GeometryBadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: string;
}

@Injectable()
export class FieldActivitiesViewModel {
  private repository = inject(FieldActivitiesRepository);
  private farmBoundaryService = inject(FarmBoundaryService);
  private messageService = inject(MessageService);

  public activities = this.repository.activities;
  public isLoading = signal(false);
  public loadFailed = signal(false);

  public globalFilter = signal<string>('');
  public selectedGeometryType = signal<'all' | 'route' | 'area'>('all');
  public startDate = signal<string>('');
  public endDate = signal<string>('');
  public viewMode = signal<'table' | 'map'>('table');

  public selectedActivity = signal<FieldActivityItem | null>(null);
  public detailsDialogVisible = signal<boolean>(false);
  public isMapFullscreen = signal<boolean>(false);

  public farmBoundary = signal<OrderedMapBoundary | null>(null);

  private map: L.Map | null = null;
  private farmPolygonLayer: L.Polygon | null = null;
  private activitiesLayerGroup: L.LayerGroup | null = null;

  private miniMap: L.Map | null = null;
  private miniMapLayer: L.GeoJSON | null = null;

  public totalCount = computed(() => this.activities().length);
  public routeCount = computed(
    () => this.activities().filter((a) => a.geometry_type === 'route').length,
  );
  public areaCount = computed(
    () => this.activities().filter((a) => a.geometry_type === 'area').length,
  );
  public withMixtureCount = computed(
    () => this.activities().filter((a) => !!a.mixture_name).length,
  );
  public withMachineCount = computed(
    () => this.activities().filter((a) => !!a.machine_name).length,
  );

  public hasActiveFilters = computed(() => {
    const hasQuery = this.globalFilter().trim().length > 0;
    const hasType = this.selectedGeometryType() !== 'all';
    const hasDates = this.startDate().trim().length > 0 || this.endDate().trim().length > 0;
    return hasQuery || hasType || hasDates;
  });

  public filteredActivities = computed(() => {
    const list = this.activities();
    const typeFilter = this.selectedGeometryType();
    const query = this.globalFilter().trim().toLowerCase();

    return list.filter((item) => {
      if (typeFilter !== 'all' && item.geometry_type !== typeFilter) {
        return false;
      }
      if (!query) {
        return true;
      }

      const matchActivity = item.activity.toLowerCase().includes(query);
      const matchResponsible = item.responsible.toLowerCase().includes(query);
      const matchMixture = item.mixture_name?.toLowerCase().includes(query) ?? false;
      const matchMachine = item.machine_name?.toLowerCase().includes(query) ?? false;
      const matchInputs = item.inputs.some(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          (i.active_ingredient?.toLowerCase().includes(query) ?? false),
      );

      return matchActivity || matchResponsible || matchMixture || matchMachine || matchInputs;
    });
  });

  constructor() {
    effect(() => {
      const items = this.filteredActivities();
      if (this.map) {
        this.drawActivities(items);
      }
    });

    effect(() => {
      this.farmBoundary();
      if (this.map) {
        this.renderFarmPolygon();
      }
    });

    void this.loadFarmBoundary();
  }

  public async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    try {
      const { error } = await this.repository.findAll(
        this.startDate() || null,
        this.endDate() || null,
      );
      if (error) {
        this.loadFailed.set(true);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar as atividades de campo.',
        });
      }
    } catch {
      this.loadFailed.set(true);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha inesperada ao comunicar com o servidor.',
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  public async filterByDates(): Promise<void> {
    await this.loadInitialData();
  }

  public clearFilters(): void {
    this.globalFilter.set('');
    this.selectedGeometryType.set('all');
    this.startDate.set('');
    this.endDate.set('');
    void this.loadInitialData();
  }

  public openDetails(activity: FieldActivityItem): void {
    this.selectedActivity.set(activity);
    this.detailsDialogVisible.set(true);
  }

  public closeDetails(): void {
    this.detailsDialogVisible.set(false);
    this.selectedActivity.set(null);
    this.destroyMiniMap();
  }

  public geometryBadgeStyle(type: 'route' | 'area'): GeometryBadgeStyle {
    if (type === 'route') {
      return {
        label: 'Rota',
        bg: 'bg-sky-50 dark:bg-sky-950/40',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-200 dark:border-sky-800/60',
        icon: 'pi pi-directions',
      };
    }
    return {
      label: 'Área',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      icon: 'pi pi-map',
    };
  }

  public initMap(elementId: string): void {
    if (this.map) return;

    this.map = L.map(elementId, {
      zoomControl: true,
      attributionControl: false,
      maxZoom: 22,
    }).setView(DEFAULT_CENTER, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 22,
      maxNativeZoom: 19,
    }).addTo(this.map);

    this.farmPolygonLayer = L.polygon([], {
      interactive: false,
      color: '#2563eb',
      weight: 2,
      fillColor: '#60a5fa',
      fillOpacity: 0.05,
    }).addTo(this.map);

    this.activitiesLayerGroup = L.layerGroup().addTo(this.map);

    this.renderFarmPolygon();
    this.drawActivities(this.filteredActivities());
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
      this.activitiesLayerGroup = null;
    }
  }

  public initMiniMap(elementId: string, activity: FieldActivityItem): void {
    this.destroyMiniMap();
    if (!activity.geometry_geojson) return;

    setTimeout(() => {
      const container = document.getElementById(elementId);
      if (!container) return;

      this.miniMap = L.map(elementId, {
        zoomControl: false,
        attributionControl: false,
        maxZoom: 22,
      }).setView(DEFAULT_CENTER, 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22,
        maxNativeZoom: 19,
      }).addTo(this.miniMap);

      const isArea = activity.geometry_type === 'area';
      this.miniMapLayer = L.geoJSON(activity.geometry_geojson as GeoJSON.GeoJsonObject, {
        style: () => ({
          color: isArea ? '#059669' : '#0284c7',
          weight: isArea ? 3 : 5,
          opacity: 0.9,
          fillColor: isArea ? '#10b981' : undefined,
          fillOpacity: isArea ? 0.35 : 0,
        }),
      }).addTo(this.miniMap);

      try {
        const bounds = this.miniMapLayer.getBounds();
        if (bounds.isValid()) {
          this.miniMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 18 });
        }
      } catch {
        // ignore bounds fit error
      }
      this.miniMap.invalidateSize();
    }, 150);
  }

  public destroyMiniMap(): void {
    if (this.miniMap) {
      this.miniMap.remove();
      this.miniMap = null;
      this.miniMapLayer = null;
    }
  }

  public setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
    this.invalidateMapSize();
  }

  public toggleFullscreen(): void {
    this.setMapFullscreen(!this.isMapFullscreen());
  }

  public focusActivityOnMap(activity: FieldActivityItem): void {
    this.viewMode.set('map');
    this.selectedActivity.set(activity);
    if (!this.map || !activity.geometry_geojson) return;

    try {
      const tempLayer = L.geoJSON(activity.geometry_geojson as GeoJSON.GeoJsonObject);
      const bounds = tempLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
      }
    } catch {
      // ignore fit bounds failure
    }
  }

  private drawActivities(activities: FieldActivityItem[]): void {
    if (!this.map || !this.activitiesLayerGroup) return;

    this.activitiesLayerGroup.clearLayers();
    if (!activities || activities.length === 0) return;

    const bounds = L.latLngBounds([]);

    activities.forEach((act) => {
      if (!act.geometry_geojson) return;

      const isArea = act.geometry_type === 'area';
      const color = isArea ? '#059669' : '#0284c7';
      const fillColor = isArea ? '#10b981' : '#38bdf8';

      const layer = L.geoJSON(act.geometry_geojson as GeoJSON.GeoJsonObject, {
        style: () => ({
          color,
          weight: isArea ? 2.5 : 4.5,
          opacity: 0.85,
          fillColor,
          fillOpacity: isArea ? 0.25 : 0,
        }),
      });

      const machineInfo = act.machine_name
        ? `<div style="font-size: 11px; margin-top: 2px; color: #b45309;"><strong>Máquina:</strong> ${act.machine_name}</div>`
        : '';

      const mixtureInfo = act.mixture_name
        ? `<div style="font-size: 11px; margin-top: 2px; color: #475569;"><strong>Calda:</strong> ${act.mixture_name}</div>`
        : '';

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; min-width: 160px;">
          <strong style="color: #0f172a; font-size: 13px;">${act.activity}</strong>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Resp: ${act.responsible}</div>
          <div style="font-size: 11px; color: #64748b;">Data: ${new Date(act.performed_at).toLocaleDateString('pt-BR')} ${new Date(act.performed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          ${machineInfo}
          ${mixtureInfo}
        </div>
      `;

      layer.bindPopup(popupContent);
      layer.on('click', () => {
        this.selectedActivity.set(act);
      });

      layer.addTo(this.activitiesLayerGroup!);

      try {
        const layerBounds = layer.getBounds();
        if (layerBounds.isValid()) {
          bounds.extend(layerBounds);
        }
      } catch {
        // ignore bounds extension failure
      }
    });

    try {
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
      }
    } catch {
      // ignore fit bounds failure
    }
  }

  private async loadFarmBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      this.farmBoundary.set(buildOrderedMapBoundary(points));
    } catch {
      this.farmBoundary.set(null);
    }
  }

  private renderFarmPolygon(): void {
    if (!this.map || !this.farmPolygonLayer) return;

    const farmBoundary = this.farmBoundary();
    if (!farmBoundary || farmBoundary.latLngs.length === 0) {
      this.farmPolygonLayer.setLatLngs([]);
      return;
    }

    this.farmPolygonLayer.setLatLngs(farmBoundary.latLngs as L.LatLngExpression[]);
  }
}

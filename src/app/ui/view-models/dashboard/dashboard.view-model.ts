import { Injectable, signal, inject, effect } from '@angular/core';
import * as L from 'leaflet';
import { HomeStatsService } from '../../../data/services/home-stats/home-stats-service';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { occurenceKeys, occurencesLabels } from '../../../shared/utils/occurrences';
import { varieties } from '../../../shared/utils/varieties';
import { getConvexHull } from '../../../shared/utils/geolocation-math';

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  icon: string;
}

export interface DashboardActivity {
  id: string;
  plantName: string;
  region: string;
  occurrences: number;
  activeOccurrences: string[];
  time: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

@Injectable()
export class DashboardViewModel {
  private homeStatsService = inject(HomeStatsService);
  private plantsRepository = inject(PlantsRepository);
  private regionsRepository = inject(RegionsRepository);

  public regionOptions = signal<{label: string, value: string}[]>([]);
  public occurrenceOptions = signal<{label: string, value: string}[]>([]);
  public varietyOptions = signal<{label: string, value: string}[]>([]);

  // Selected filters
  public selectedRegion = signal<string | null>(null);
  public selectedOccurrence = signal<string | null>(null);
  public selectedVariety = signal<string | null>(null);

  private map: L.Map | null = null;
  private plantLayers: L.LayerGroup | null = null;

  // State
  public metrics = signal<DashboardMetric[]>([
    { label: 'Total de Plantas', value: '-', change: '', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3.75-3h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0121 21H3a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 013 3z' },
    { label: 'Plantas Vivas', value: '-', change: '', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    { label: 'Plantas Atualizadas', value: '-', change: '', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
    { label: 'Última Atualização', value: '-', change: '', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' }
  ]);

  public recentActivities = signal<DashboardActivity[]>([]);

  constructor() {
    this.loadOptions();
    this.refreshData();

    // Reactive effect: re-fetch and plot plants when any filter changes
    effect(() => {
      const region = this.selectedRegion();
      const occurrence = this.selectedOccurrence();
      const variety = this.selectedVariety();

      // Only query if at least one filter is active
      if (region || occurrence || variety) {
        this.fetchAndPlotPlants(region, occurrence, variety);
      } else {
        // Clear plant circles if all filters are reset
        this.clearPlantLayers();
      }
    });
  }

  async loadOptions() {
    await this.regionsRepository.findAll();
    const regions = this.regionsRepository.regions();

    const uniqueRegionsMap = new Map<string, string>();
    regions.forEach(r => {
      if (!uniqueRegionsMap.has(r.region)) {
        uniqueRegionsMap.set(r.region, r.id);
      }
    });

    this.regionOptions.set([
      { label: 'Nenhum', value: '' },
      ...Array.from(uniqueRegionsMap.keys()).map(region => ({ label: region, value: region }))
    ]);

    // Draw polygons after regions are loaded
    if (this.map) {
      this.drawRegionPolygons();
    }

    this.occurrenceOptions.set([
      { label: 'Nenhum', value: '' },
      ...Object.entries(occurencesLabels).map(([key, label]) => ({ label, value: key }))
    ]);

    this.varietyOptions.set([
      { label: 'Nenhum', value: '' },
      ...varieties.map(v => ({ label: v, value: v }))
    ]);
  }

  private readonly REGION_COLORS = [
    '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
    '#6366f1', '#d97706'
  ];

  initMap(elementId: string) {
    if (this.map) {
      this.map.remove();
    }

    const regions = this.regionsRepository.regions();
    const mainRegions = regions.filter(r => ['A','B','C','D','E','F','G','H','I','J'].includes(r.region));
    const centerLat = mainRegions.length
      ? mainRegions.reduce((s, r) => s + r.latitude, 0) / mainRegions.length
      : -23.403;
    const centerLng = mainRegions.length
      ? mainRegions.reduce((s, r) => s + r.longitude, 0) / mainRegions.length
      : -49.149;

    this.map = L.map(elementId, { maxZoom: 22 }).setView([centerLat, centerLng], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 22,
      maxNativeZoom: 19
    }).addTo(this.map);

    // Initialize a dedicated layer group for plant markers
    this.plantLayers = L.layerGroup().addTo(this.map);

    // Draw polygons if regions are already loaded
    if (this.regionsRepository.regions().length > 0) {
      this.drawRegionPolygons();
    }
  }

  drawRegionPolygons() {
    if (!this.map) return;
    const regions = this.regionsRepository.regions();

    // Group points by region name
    const grouped = new Map<string, { lat: number, lng: number }[]>();
    regions.forEach(r => {
      if (!grouped.has(r.region)) grouped.set(r.region, []);
      grouped.get(r.region)!.push({ lat: r.latitude, lng: r.longitude });
    });

    // Draw polygons with distinct colors
    const regionNames = Array.from(grouped.keys()).sort();
    regionNames.forEach((name, index) => {
      const points = grouped.get(name)!;
      if (points.length < 3) return;

      // Use convex hull for better polygon representation
      const coords: [number, number][] = points.map(p => [p.lat, p.lng]);
      const hull = getConvexHull(coords);

      const color = this.REGION_COLORS[index % this.REGION_COLORS.length];
      const latlngs: L.LatLngExpression[] = hull.map(p => [p[0], p[1]]);

      L.polygon(latlngs, {
        color: color,
        fillColor: color,
        fillOpacity: 0.2,
        weight: 2,
      }).bindTooltip(name, { permanent: true, direction: 'center', className: 'region-label' }).addTo(this.map!);
    });
  }

  onRegionChange(value: string) {
    this.selectedRegion.set(value === '' ? null : value);
  }

  onOccurrenceChange(value: string) {
    this.selectedOccurrence.set(value === '' ? null : value);
  }

  onVarietyChange(value: string) {
    this.selectedVariety.set(value === '' ? null : value);
  }

  private clearPlantLayers() {
    if (this.plantLayers) {
      this.plantLayers.clearLayers();
    }
  }

  private async fetchAndPlotPlants(
    region: string | null,
    occurrence: string | null,
    variety: string | null
  ) {
    if (!this.map) return;

    const filters = {
      region: region ?? '',
      occurrence: occurrence ?? '',
      variety: variety ?? '',
    };

    const plants = await this.plantsRepository.queryPlants(filters);

    // Clear previous plant circles
    this.clearPlantLayers();
    if (!this.plantLayers) {
      this.plantLayers = L.layerGroup().addTo(this.map);
    }

    plants.forEach(plant => {
      if (!plant.latitude || !plant.longitude) return;
      L.circleMarker([plant.latitude, plant.longitude], {
        radius: 5,
        color: '#059669', // Emerald 600
        fillColor: '#10b981', // Emerald 500
        fillOpacity: 0.8,
        weight: 1.5,
      }).on('click', () => {
        this.openDetails(this.mapPlantToActivity(plant));
      }).bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 140px">
          <strong>Região: ${plant.region ?? '-'}</strong><br/>
          Variedade: ${plant.variety ?? '-'}<br/>
          ID: ${plant.id.split('-')[0]}...
        </div>
      `).addTo(this.plantLayers!);
    });

    // Zoom to region if selected
    if (region) {
      const regionPoints = this.regionsRepository.regions().filter(r => r.region === region);
      if (regionPoints.length > 0) {
        const coords: [number, number][] = regionPoints.map(p => [p.latitude, p.longitude]);
        const hull = getConvexHull(coords);
        const bounds = L.latLngBounds(hull.map(p => [p[0], p[1]]));
        this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 21 });
      }
    }
  }

  public selectedActivity = signal<DashboardActivity | null>(null);

  openDetails(activity: DashboardActivity) {
    this.selectedActivity.set(activity);
  }

  closeDetails() {
    this.selectedActivity.set(null);
  }

  mapPlantToActivity(plant: any): DashboardActivity {
    const activeOccurrencesList: string[] = [];
    const occurrencesCount = occurenceKeys.reduce((acc, key) => {
      const value = plant[key];
      if (value) {
        activeOccurrencesList.push(occurencesLabels[key as keyof typeof occurencesLabels] || key);
      }
      return acc + (value ? 1 : 0);
    }, 0);

    const dateStr = plant.updated_at || plant.created_at;
    const timeStr = dateStr ? new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) : '-';

    return {
      id: plant.id,
      plantName: `Planta ${plant.id?.split("-")[0] || '?'}...`,
      region: plant.region || '-',
      occurrences: occurrencesCount,
      activeOccurrences: activeOccurrencesList,
      time: timeStr,
      type: occurrencesCount > 0 ? 'warning' : 'success'
    };
  }

  async refreshData() {
    try {
      const stats = await this.homeStatsService.getHomeStats();
      const lastUpdateStr = stats.latest_updated_at
        ? new Date(stats.latest_updated_at).toLocaleDateString('pt-BR')
        : '-';

      this.metrics.set([
        { label: 'Total de Plantas', value: stats.total_plants.toString(), change: '', icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3.75-3h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0121 21H3a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 013 3z' },
        { label: 'Plantas Vivas', value: stats.alive_plants.toString(), change: '', icon: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
        { label: 'Plantas Atualizadas', value: stats.updated_plants.toString(), change: '', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
        { label: 'Última Atualização', value: lastUpdateStr, change: '', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' }
      ]);

      const recentUpdates = await this.plantsRepository.getRecentUpdates();
      const activities: DashboardActivity[] = recentUpdates.map(update => this.mapPlantToActivity(update));

      this.recentActivities.set(activities);
    } catch (e) {
      console.error('Failed to load metrics', e);
    }
  }
}

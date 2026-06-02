import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import { HomeDashboardRepository } from '../../../data/repositories/home-dashboard/home-dashboard-repository';
import type {
  HomeDashboardLegendItem,
  HomeDashboardOccurrence,
  HomeDashboardPlant,
  HomeDashboardSummary,
  HomeDashboardVariety,
  HomeDashboardZone,
} from '../../../domain/models/home-dashboard.model';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];
const VARIETY_COLORS = [
  '#0f766e',
  '#1d4ed8',
  '#b45309',
  '#b91c1c',
  '#7c3aed',
  '#0ea5e9',
  '#be185d',
  '#4338ca',
  '#15803d',
  '#c2410c',
  '#0284c7',
  '#a21caf',
  '#ca8a04',
  '#dc2626',
  '#0369a1',
  '#4f46e5',
];
const CLASSICA_VARIETY_COLOR = '#ec4899';
const FALLBACK_VARIETY_COLOR = '#16a34a';

@Injectable()
export class DashboardViewModel {
  private homeDashboardRepository = inject(HomeDashboardRepository);

  private map: L.Map | null = null;
  private plantLayers: L.LayerGroup | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });

  public isLoading = signal(true);
  public isMapFullscreen = signal(false);
  public summary = signal<HomeDashboardSummary | null>(null);
  public mapPlants = signal<HomeDashboardPlant[]>([]);

  // --- Filter state ---
  public filterStartDate = signal('');
  public filterEndDate = signal('');
  public filterZoneId = signal('');
  public filterOccurrenceId = signal('');
  public filterVarietyId = signal('');
  public filterOperation = signal('');

  // --- Filter options (loaded from DB) ---
  public availableZones = signal<HomeDashboardZone[]>([]);
  public availableOccurrences = signal<HomeDashboardOccurrence[]>([]);

  public availableVarieties = computed<HomeDashboardVariety[]>(() => {
    const summary = this.summary();
    return summary?.varieties ?? [];
  });

  public varietyLegend = computed<HomeDashboardLegendItem[]>(() => {
    const summary = this.summary();
    const plants = this.mapPlants();
    return this.buildVarietyLegend(summary?.varieties ?? [], plants);
  });

  public filteredPlants = computed<HomeDashboardPlant[]>(() => {
    const plants = this.mapPlants();
    const varietyId = this.filterVarietyId();

    if (!varietyId) {
      return plants;
    }

    const varietyIdNum = Number(varietyId);
    return plants.filter((plant) => plant.varietyId === varietyIdNum);
  });

  public plottedPlantsCount = computed(() => this.filteredPlants().length);

  constructor() {
    effect(() => {
      this.filteredPlants();
      this.varietyLegend();
      this.renderPlants();
    });

    void this.loadDashboard();
  }

  public async loadDashboard(): Promise<void> {
    this.isLoading.set(true);

    try {
      const [snapshot, filterOptions] = await Promise.all([
        this.homeDashboardRepository.getSnapshot(),
        this.homeDashboardRepository.getFilterOptions(),
      ]);

      this.summary.set(snapshot.summary);
      this.mapPlants.set(snapshot.plants);
      this.availableZones.set(filterOptions.zones);
      this.availableOccurrences.set(filterOptions.occurrences);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
      this.summary.set({
        totalPlants: 0,
        totalZones: 0,
        totalOccurrenceTypes: 0,
        totalVarieties: 0,
        varieties: [],
      });
      this.mapPlants.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  public initMap(elementId: string): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(elementId, { maxZoom: 22, preferCanvas: true }).setView(DEFAULT_CENTER, 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 22,
      maxNativeZoom: 19,
    }).addTo(this.map);

    this.plantLayers = L.layerGroup().addTo(this.map);
    this.renderPlants();
  }

  public invalidateMapSize(): void {
    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 300);
    }
  }

  public setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
  }

  public getVarietyColor(varietyId: number | null, varietyName: string | null): string {
    const legend = this.varietyLegend();

    if (varietyId !== null) {
      const entryById = legend.find((item) => item.varietyId === varietyId);
      if (entryById) {
        return entryById.color;
      }
    }

    const normalizedVarietyName = this.normalizeVarietyLabel(varietyName);
    const entryByLabel = legend.find(
      (item) => this.normalizeVarietyLabel(item.label) === normalizedVarietyName,
    );

    return entryByLabel?.color ?? FALLBACK_VARIETY_COLOR;
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
      map.setView(DEFAULT_CENTER, 16);
      return;
    }

    plants.forEach((plant) => {
      const plantColor = this.getVarietyColor(plant.varietyId, plant.varietyName);

      L.circleMarker([plant.latitude, plant.longitude], {
        radius: 2,
        color: plantColor,
        fillColor: plantColor,
        fillOpacity: 0.9,
        weight: 0.75,
        renderer: this.plantRenderer,
      })
        .bindPopup(
          `
            <div style="font-family: sans-serif; font-size: 12px; min-width: 160px">
              <strong>${plant.varietyName ?? 'Sem variedade'}</strong><br/>
              ID: ${plant.id}<br/>
              ${plant.latitude.toFixed(6)}, ${plant.longitude.toFixed(6)}
            </div>
          `,
        )
        .addTo(plantLayers);
    });

    const bounds = L.latLngBounds(
      plants.map((plant) => [plant.latitude, plant.longitude] as [number, number]),
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
    }
  }

  private buildVarietyLegend(
    varieties: HomeDashboardVariety[],
    plants: HomeDashboardPlant[],
  ): HomeDashboardLegendItem[] {
    const varietyEntries: HomeDashboardLegendItem[] = varieties.map((variety, index) => ({
      label: variety.name,
      color: this.getLegendColor(variety.name, index),
      varietyId: variety.id,
    }));

    const hasPlantsWithoutVariety = plants.some((plant) => !plant.varietyName);

    if (hasPlantsWithoutVariety) {
      varietyEntries.push({
        label: 'Sem variedade',
        color: FALLBACK_VARIETY_COLOR,
        varietyId: null,
      });
    }

    return varietyEntries;
  }

  private formatCount(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  }

  private normalizeVarietyLabel(value: string | null): string {
    if (!value) {
      return 'sem variedade';
    }

    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLocaleLowerCase('pt-BR');
  }

  private getLegendColor(varietyName: string, index: number): string {
    if (this.normalizeVarietyLabel(varietyName) === 'classica') {
      return CLASSICA_VARIETY_COLOR;
    }

    return VARIETY_COLORS[index % VARIETY_COLORS.length];
  }
}

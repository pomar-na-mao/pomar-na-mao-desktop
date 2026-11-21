import {
  computed,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
} from '@angular/core';
import * as L from 'leaflet';
import { ForecastMassLayer } from '../../../shared/utils/forecast-mass-layer';
import { HarvestForecastRepository } from '../../../data/repositories/harvest-forecast/harvest-forecast.repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { Region } from '../../../domain/models/regions.model';
import type { Zone } from '../../../domain/models/zone.model';
import {
  HARVEST_FORECAST_CLASSIFICATIONS,
  HARVEST_FORECAST_CLASSIFICATION_COLORS,
  HARVEST_FORECAST_CLASSIFICATION_LABELS,
  HARVEST_FORECAST_SCENARIOS,
  HARVEST_FORECAST_SCENARIO_LABELS,
  PRODUCTIVE_HARVEST_CLASSIFICATIONS,
  calculateHarvestForecast,
  cloneHarvestForecastWeights,
  isValidHarvestForecastWeight,
  type HarvestForecastCalculation,
  type HarvestForecastClassification,
  type HarvestForecastItem,
  type HarvestForecastScenario,
  type HarvestForecastWeights,
  type ProductiveHarvestClassification,
} from '../../../domain/models/harvest-forecast.model';
import { buildOrderedMapBoundary } from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_CENTER: L.LatLngTuple = [-23.403, -49.149];
const ZONE_COLORS = [
  '#0EA5E9',
  '#F97316',
  '#A855F7',
  '#10B981',
  '#EC4899',
  '#EAB308',
];

export interface HarvestForecastMarkerDescriptor {
  plantId: string;
  classification: HarvestForecastClassification;
  color: string;
  label: string;
  latitude: number;
  longitude: number;
}

interface ZonePolygon {
  id: string;
  name: string;
  points: L.LatLngTuple[];
  color: string;
}

@Injectable()
export class HarvestForecastViewModel {
  private repository = inject(HarvestForecastRepository);
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);
  private farmBoundaryService = inject(FarmBoundaryService);

  public readonly classifications = HARVEST_FORECAST_CLASSIFICATIONS;
  public readonly productiveClassifications =
    PRODUCTIVE_HARVEST_CLASSIFICATIONS;
  public readonly scenarios = HARVEST_FORECAST_SCENARIOS;
  public readonly classificationLabels = HARVEST_FORECAST_CLASSIFICATION_LABELS;
  public readonly classificationColors = HARVEST_FORECAST_CLASSIFICATION_COLORS;
  public readonly scenarioLabels = HARVEST_FORECAST_SCENARIO_LABELS;

  public items = this.repository.items;
  public isLoading = this.repository.isLoading;
  public loadError = this.repository.error;
  public zones = this.zonesRepository.zones;

  public startDate = signal('');
  public endDate = signal('');
  public selectedClassifications = signal<HarvestForecastClassification[]>([]);
  public selectedZoneId = signal('');
  public selectedScenario = signal<HarvestForecastScenario>('realistic');
  public weights = signal<HarvestForecastWeights>(
    cloneHarvestForecastWeights(),
  );
  public calculation = signal<HarvestForecastCalculation | null>(null);
  public hasFilterInteraction = signal(false);
  public territoryLoadFailed = signal(false);
  public isMapFullscreen = signal(false);
  public mapMode = signal<'points' | 'heatmap'>('points');
  public farmPolygon = signal<L.LatLngTuple[] | null>(null);
  public markerDescriptors = signal<HarvestForecastMarkerDescriptor[]>([]);

  public dateError = computed(() => {
    const start = this.startDate();
    const end = this.endDate();
    return start && end && start > end
      ? 'A data inicial deve ser anterior ou igual à data final.'
      : null;
  });

  public weightsValid = computed(() =>
    this.scenarios.every((scenario) =>
      this.productiveClassifications.every((classification) =>
        isValidHarvestForecastWeight(this.weights()[scenario][classification]),
      ),
    ),
  );

  public canCalculate = computed(
    () => !this.isLoading() && !this.dateError() && this.weightsValid(),
  );

  public showEmptyState = computed(
    () =>
      this.hasFilterInteraction() &&
      !this.isLoading() &&
      !this.loadError() &&
      this.items().length === 0,
  );

  public zonePolygons = computed<ZonePolygon[]>(() =>
    this.buildZonePolygons(this.zones(), this.regionsRepository.regions()),
  );

  private map: L.Map | null = null;
  private territoryLayer: L.LayerGroup | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private heatLayer: ForecastMassLayer | null = null;
  private filterTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.repository.clear();

    effect(() => {
      const items = this.items();
      // Track these even before the Leaflet map has been initialized.
      this.mapMode();
      this.selectedScenario();
      this.weights();
      untracked(() => this.renderMarkers(items));
    });

    effect(() => {
      this.farmPolygon();
      this.zonePolygons();
      this.renderTerritory();
    });
  }

  public async loadInitialData(): Promise<void> {
    this.territoryLoadFailed.set(false);
    try {
      const [boundary, zoneResult, regionResult] = await Promise.all([
        this.farmBoundaryService.getBoundary().catch(() => []),
        this.zonesRepository.findAll(),
        this.regionsRepository.findAll(),
      ]);

      const orderedBoundary = buildOrderedMapBoundary(boundary);
      this.farmPolygon.set(orderedBoundary?.latLngs ?? null);
      this.territoryLoadFailed.set(!!zoneResult.error || !!regionResult.error);
      this.renderTerritory();
    } catch {
      this.territoryLoadFailed.set(true);
    }
  }

  public setStartDate(value: string | null): void {
    this.startDate.set(value || '');
    this.onFilterChanged();
  }

  public setEndDate(value: string | null): void {
    this.endDate.set(value || '');
    this.onFilterChanged();
  }

  public setClassifications(values: string | string[]): void {
    const list = (
      Array.isArray(values) ? values : values ? [values] : []
    ).filter((value): value is HarvestForecastClassification =>
      HARVEST_FORECAST_CLASSIFICATIONS.includes(
        value as HarvestForecastClassification,
      ),
    );
    this.selectedClassifications.set([...new Set(list)]);
    this.onFilterChanged();
  }

  public setZoneId(value: string | number | string[] | null): void {
    this.selectedZoneId.set(
      Array.isArray(value) ? String(value[0] ?? '') : String(value ?? ''),
    );
    this.onFilterChanged();
    this.fitCurrentContent();
  }

  public setScenario(value: string | number | string[] | null): void {
    const scenario = String(
      Array.isArray(value) ? (value[0] ?? '') : (value ?? ''),
    );
    if (
      HARVEST_FORECAST_SCENARIOS.includes(scenario as HarvestForecastScenario)
    ) {
      this.selectedScenario.set(scenario as HarvestForecastScenario);
      this.invalidateCalculation();
    }
  }

  public setWeight(
    scenario: HarvestForecastScenario,
    classification: ProductiveHarvestClassification,
    rawValue: string | number | null,
  ): void {
    const value =
      rawValue === '' || rawValue === null ? Number.NaN : Number(rawValue);
    this.weights.update((current) => ({
      ...current,
      [scenario]: {
        ...current[scenario],
        [classification]: value,
      },
    }));
    this.invalidateCalculation();
  }

  public isWeightValid(
    scenario: HarvestForecastScenario,
    classification: ProductiveHarvestClassification,
  ): boolean {
    return isValidHarvestForecastWeight(
      this.weights()[scenario][classification],
    );
  }

  public calculate(): void {
    if (!this.canCalculate()) return;
    this.calculation.set(
      calculateHarvestForecast(
        this.items(),
        this.selectedScenario(),
        this.weights(),
      ),
    );
  }

  public formatKg(value: number): string {
    return (
      new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value) + ' kg'
    );
  }

  public async applyFilters(): Promise<void> {
    if (this.dateError()) return;
    this.invalidateCalculation();
    await this.repository.findAll({
      startDate: this.startDate() || null,
      endDate: this.endDate() || null,
      classifications: this.selectedClassifications().length
        ? this.selectedClassifications()
        : null,
      zoneId: this.selectedZoneId() || null,
    });
  }

  public retry(): void {
    if (this.hasFilterInteraction()) void this.applyFilters();
  }

  public clearFilters(): void {
    if (this.filterTimer) clearTimeout(this.filterTimer);
    this.filterTimer = null;
    this.startDate.set('');
    this.endDate.set('');
    this.selectedClassifications.set([]);
    this.selectedZoneId.set('');
    this.hasFilterInteraction.set(false);
    this.repository.clear();
    this.invalidateCalculation();
    this.renderMarkers([]);
    this.fitCurrentContent();
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
      { maxZoom: 22, maxNativeZoom: 18, attribution: 'Esri World Imagery' },
    ).addTo(this.map);
    this.territoryLayer = L.layerGroup().addTo(this.map);
    this.map.createPane('forecastPlants').style.zIndex = '450';
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.renderTerritory();
    this.renderMarkers(this.items());
  }

  public invalidateMapSize(): void {
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  public setMapFullscreen(value: boolean): void {
    this.isMapFullscreen.set(value);
  }

  public setMapMode(mode: 'points' | 'heatmap'): void {
    this.mapMode.set(mode);
    this.renderMarkers(this.items());
  }

  public destroyMap(): void {
    if (this.filterTimer) clearTimeout(this.filterTimer);
    this.filterTimer = null;
    this.map?.remove();
    this.map = null;
    this.territoryLayer = null;
    this.markersLayer = null;
    this.heatLayer = null;
  }

  public renderMarkers(items: readonly HarvestForecastItem[]): void {
    const unique = new Map<string, HarvestForecastItem>();
    for (const item of items) {
      if (
        !unique.has(item.plant_id) &&
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude) &&
        item.latitude >= -90 &&
        item.latitude <= 90 &&
        item.longitude >= -180 &&
        item.longitude <= 180
      ) {
        unique.set(item.plant_id, item);
      }
    }

    const descriptors = [...unique.values()].map((item) => ({
      plantId: item.plant_id,
      classification: item.classification,
      color: HARVEST_FORECAST_CLASSIFICATION_COLORS[item.classification],
      label: `${item.classification} — ${HARVEST_FORECAST_CLASSIFICATION_LABELS[item.classification]}`,
      latitude: item.latitude,
      longitude: item.longitude,
    }));
    this.markerDescriptors.set(descriptors);

    if (!this.map || !this.markersLayer) return;
    this.markersLayer.clearLayers();
    const isHeatmap = this.mapMode() === 'heatmap';
    const scenario = this.selectedScenario();
    const weights = this.weights()[scenario];
    if (isHeatmap) {
      const points: L.LatLngTuple[] = descriptors.flatMap((point) => {
        const kg =
          point.classification === 'N' ? 0 : weights[point.classification];
        return isValidHarvestForecastWeight(kg) && kg > 0
          ? [[point.latitude, point.longitude, kg] as L.LatLngTuple]
          : [];
      });
      if (!this.heatLayer) {
        this.heatLayer = new ForecastMassLayer(points);
      } else {
        this.heatLayer.setLatLngs(points);
      }
      if (!this.map.hasLayer(this.heatLayer)) this.heatLayer.addTo(this.map);
    } else {
      this.heatLayer?.remove();
    }
    for (const descriptor of descriptors) {
      const marker = L.circleMarker(
        [descriptor.latitude, descriptor.longitude],
        {
          pane: 'forecastPlants',
          radius: isHeatmap ? 12 : 7,
          fillColor: descriptor.color,
          color: descriptor.classification === 'M' ? '#713F12' : '#FFFFFF',
          weight: 2,
          opacity: isHeatmap ? 0 : 1,
          fillOpacity: isHeatmap ? 0 : 0.92,
        },
      );
      const kg =
        descriptor.classification === 'N'
          ? 0
          : weights[descriptor.classification];
      const mass = isValidHarvestForecastWeight(kg)
        ? this.formatKg(kg)
        : 'Peso inválido';
      const scenarioLabel = this.scenarioLabels[scenario];
      const accessibleLabel = `${descriptor.label}; planta ${descriptor.plantId}; massa prevista por planta: ${mass}; cenário ${scenarioLabel}`;
      marker.bindTooltip(
        `<strong>${escapeHtml(descriptor.label)}</strong><br>Massa prevista por planta: <strong>${escapeHtml(mass)}</strong><br>Cenário: ${escapeHtml(scenarioLabel)}<br>Planta: ${escapeHtml(descriptor.plantId)}`,
        { direction: 'top', sticky: true },
      );
      marker.on('add', () => {
        const element = marker.getElement();
        element?.setAttribute('role', 'img');
        element?.setAttribute('aria-label', accessibleLabel);
      });
      marker.addTo(this.markersLayer);
    }
  }

  private onFilterChanged(): void {
    this.hasFilterInteraction.set(true);
    this.invalidateCalculation();
    if (this.filterTimer) clearTimeout(this.filterTimer);
    if (this.dateError()) return;
    this.filterTimer = setTimeout(() => {
      this.filterTimer = null;
      void this.applyFilters();
    }, 200);
  }

  private invalidateCalculation(): void {
    this.calculation.set(null);
  }

  private renderTerritory(): void {
    if (!this.map || !this.territoryLayer) return;
    this.territoryLayer.clearLayers();
    const farm = this.farmPolygon();
    if (farm && farm.length >= 3) {
      L.polygon(farm, {
        interactive: false,
        color: '#FFFFFF',
        weight: 2,
        fill: false,
        dashArray: '4, 4',
      }).addTo(this.territoryLayer);
    }
    for (const zone of this.zonePolygons()) {
      L.polygon(zone.points, {
        color: zone.color,
        weight: 2,
        fill: false,
        fillOpacity: 0,
      })
        .bindTooltip(escapeHtml(zone.name))
        .addTo(this.territoryLayer);
    }
    untracked(() => this.fitCurrentContent());
  }

  private fitCurrentContent(): void {
    if (!this.map) return;
    const selectedZone = this.zonePolygons().find(
      (zone) => zone.id === this.selectedZoneId(),
    );
    if (selectedZone) {
      this.map.fitBounds(L.latLngBounds(selectedZone.points), {
        padding: [30, 30],
      });
      return;
    }

    const points: L.LatLngTuple[] = [
      ...(this.farmPolygon() ?? []),
      ...this.zonePolygons().flatMap((zone) => zone.points),
      ...this.markerDescriptors().map(
        (marker) => [marker.latitude, marker.longitude] as L.LatLngTuple,
      ),
    ];
    if (points.length) {
      this.map.fitBounds(L.latLngBounds(points), {
        padding: [30, 30],
        maxZoom: 17,
      });
    }
  }

  private buildZonePolygons(zones: Zone[], regions: Region[]): ZonePolygon[] {
    const grouped = new Map<string, Region[]>();
    for (const region of regions) {
      if (
        !region.zone_id ||
        !Number.isFinite(region.latitude) ||
        !Number.isFinite(region.longitude)
      )
        continue;
      const current = grouped.get(region.zone_id) ?? [];
      current.push(region);
      grouped.set(region.zone_id, current);
    }

    return zones.flatMap((zone, index) => {
      const regionPoints = (grouped.get(zone.id) ?? [])
        .filter((region) => Number.isFinite(Number(region.order)))
        .sort((left, right) => Number(left.order) - Number(right.order))
        .map((region) => [region.latitude, region.longitude] as L.LatLngTuple);
      const points =
        regionPoints.length >= 3
          ? regionPoints
          : this.parseZonePolygon(zone.polygon);
      return points.length >= 3
        ? [
            {
              id: zone.id,
              name: zone.name,
              points,
              color: ZONE_COLORS[index % ZONE_COLORS.length],
            },
          ]
        : [];
    });
  }

  private parseZonePolygon(
    polygon: Record<string, unknown> | null | undefined,
  ): L.LatLngTuple[] {
    if (!polygon || polygon['type'] !== 'Polygon') return [];
    const rings = polygon['coordinates'];
    if (!Array.isArray(rings) || !Array.isArray(rings[0])) return [];
    const points = rings[0]
      .map((point): L.LatLngTuple | null => {
        if (!Array.isArray(point) || point.length < 2) return null;
        const [longitude, latitude] = point;
        return Number.isFinite(latitude) && Number.isFinite(longitude)
          ? [latitude as number, longitude as number]
          : null;
      })
      .filter((point): point is L.LatLngTuple => point !== null);
    if (points.length > 3) {
      const first = points[0];
      const last = points[points.length - 1];
      if (first[0] === last[0] && first[1] === last[1])
        return points.slice(0, -1);
    }
    return points;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

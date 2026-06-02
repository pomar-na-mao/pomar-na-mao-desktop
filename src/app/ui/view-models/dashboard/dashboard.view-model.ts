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
  private zonePolygonLayer: L.GeoJSON | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });
  private heatmapRenderer: L.Canvas | null = null;
  private heatmapPaneElement: HTMLElement | null = null;

  public isLoading = signal(true);
  public isMapFullscreen = signal(false);
  public summary = signal<HomeDashboardSummary | null>(null);
  public mapPlants = signal<HomeDashboardPlant[]>([]);

  // --- Filter state ---
  private today = new Date().toISOString().slice(0, 10);
  public filterStartDate = signal(this.today);
  public filterEndDate = signal(this.today);
  public filterZoneId = signal('');
  public filterOccurrenceId = signal('');
  public filterVarietyId = signal('');
  public filterOperation = signal('');

  // --- Filter options (loaded from DB) ---
  public availableZones = signal<HomeDashboardZone[]>([]);
  public availableOccurrences = signal<HomeDashboardOccurrence[]>([]);
  public openOccurrences = signal<Array<{ plant_id: string; occurrence_type_id: string }>>([]);

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
    let plants = this.mapPlants();

    // 1. Filter by Variety
    const varietyId = this.filterVarietyId();
    if (varietyId) {
      const varietyIdNum = Number(varietyId);
      plants = plants.filter((plant) => plant.varietyId === varietyIdNum);
    }

    // 2. Filter by Zone
    const zoneId = this.filterZoneId();
    if (zoneId) {
      const zone = this.availableZones().find((z) => z.id === zoneId);
      if (zone?.polygon) {
        plants = plants.filter((plant) => isPointInPolygon(plant.latitude, plant.longitude, zone.polygon!));
      }
    }

    // 3. Filter by Occurrence
    const occurrenceId = this.filterOccurrenceId();
    if (occurrenceId) {
      const matchingPlantIds = new Set(
        this.openOccurrences()
          .filter((oc) => oc.occurrence_type_id === occurrenceId)
          .map((oc) => oc.plant_id)
      );
      plants = plants.filter((plant) => matchingPlantIds.has(plant.id));
    }

    return plants;
  });

  public plottedPlantsCount = computed(() => this.filteredPlants().length);

  constructor() {
    effect(() => {
      this.filteredPlants();
      this.varietyLegend();
      this.renderPlants();
    });

    effect(() => {
      const zoneId = this.filterZoneId();
      this.renderZonePolygon(zoneId);
    });

    void this.loadDashboard();
  }

  public async loadDashboard(): Promise<void> {
    this.isLoading.set(true);

    try {
      const [snapshot, filterOptions, openOccs] = await Promise.all([
        this.homeDashboardRepository.getSnapshot(),
        this.homeDashboardRepository.getFilterOptions(),
        this.homeDashboardRepository.getOpenOccurrences(),
      ]);

      this.summary.set(snapshot.summary);
      this.mapPlants.set(snapshot.plants);
      this.availableZones.set(filterOptions.zones);
      this.availableOccurrences.set(filterOptions.occurrences);
      this.openOccurrences.set(openOccs);
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
    this.zonePolygonLayer = L.geoJSON(undefined, {
      style: {
        color: '#06b6d4',
        weight: 3,
        fillColor: '#06b6d4',
        fillOpacity: 0.12,
        dashArray: '6 4',
      },
    }).addTo(this.map);

    const heatmapPane = this.map.createPane('heatmapPane');
    heatmapPane.style.zIndex = '550';
    heatmapPane.style.pointerEvents = 'none';
    heatmapPane.style.filter = 'blur(20px)';
    this.heatmapPaneElement = heatmapPane;
    this.heatmapRenderer = L.canvas({ padding: 0.5, pane: 'heatmapPane' });

    this.renderPlants();
    this.renderZonePolygon(this.filterZoneId());
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

    const occurrenceId = this.filterOccurrenceId();
    const isHarvest = this.filterOperation() === 'colheita';

    // Toggle the blur filter on heatmap pane depending on the mode
    if (this.heatmapPaneElement) {
      this.heatmapPaneElement.style.filter = isHarvest ? 'blur(16px) contrast(3.0) saturate(1.8)' : 'blur(20px)';
    }

    // Pre-calculate zone weights and calculate centers to create radial gradients
    const zoneWeights = new Map<string, number>();
    const zones = this.availableZones();
    const zonePlants = new Map<string, HomeDashboardPlant[]>();
    const zoneCenters = new Map<string, { lat: number; lng: number; maxDist: number }>();

    if (isHarvest) {
      zones.forEach((zone) => {
        const hash = parseInt(zone.id.replace(/-/g, '').slice(0, 4), 16) || 0;
        // Bias the base weights slightly higher (0.35 to 1.0) to include more vibrant orange/red tones
        const zoneWeight = 0.35 + (hash % 65) / 100; // 0.35 to 1.0
        zoneWeights.set(zone.id, zoneWeight);
      });

      // Group plants by zone to compute their spatial distribution
      plants.forEach((plant) => {
        const plantZone = zones.find((zone) =>
          zone.polygon && isPointInPolygon(plant.latitude, plant.longitude, zone.polygon)
        );
        if (plantZone) {
          if (!zonePlants.has(plantZone.id)) {
            zonePlants.set(plantZone.id, []);
          }
          zonePlants.get(plantZone.id)!.push(plant);
        }
      });

      // Calculate centers and max radius (distance) for each zone
      zonePlants.forEach((pList, zoneId) => {
        if (pList.length === 0) return;
        let sumLat = 0;
        let sumLng = 0;
        pList.forEach((p) => {
          sumLat += p.latitude;
          sumLng += p.longitude;
        });
        const avgLat = sumLat / pList.length;
        const avgLng = sumLng / pList.length;

        let maxDist = 0;
        pList.forEach((p) => {
          const dist = Math.sqrt(Math.pow(p.latitude - avgLat, 2) + Math.pow(p.longitude - avgLng, 2));
          if (dist > maxDist) {
            maxDist = dist;
          }
        });

        zoneCenters.set(zoneId, { lat: avgLat, lng: avgLng, maxDist: maxDist || 0.0001 });
      });
    }

    plants.forEach((plant) => {
      let plantColor = this.getVarietyColor(plant.varietyId, plant.varietyName);
      let radius = 2;
      let strokeColor = plantColor;
      let weight = 0.75;
      let fillOpacity = isHarvest ? 0.45 : 0.9;

      if (occurrenceId) {
        // Plot with a striking neon magenta color with white border and larger size
        plantColor = '#ff0055';
        strokeColor = '#ffffff';
        radius = 4;
        weight = 1.5;
        fillOpacity = 1.0;
      }

      // If harvest mode is active, do not render individual plant markers underneath
      if (!isHarvest) {
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
                <strong>${plant.varietyName ?? 'Sem variedade'}</strong><br/>
                ID: ${plant.id}<br/>
                ${plant.latitude.toFixed(6)}, ${plant.longitude.toFixed(6)}
              </div>
            `,
          )
          .addTo(plantLayers);
      }

      // If harvest mode is active, render large solid overlapping circle markers on the heatmap pane
      if (isHarvest && this.heatmapRenderer) {
        // Find which zone this plant belongs to for zone-based (lot-based) representation
        const plantZone = zones.find((zone) =>
          zone.polygon && isPointInPolygon(plant.latitude, plant.longitude, zone.polygon)
        );
        
        let weightFactor = 0.5;
        if (plantZone) {
          const zoneBaseWeight = zoneWeights.get(plantZone.id) ?? 0.5;
          const centerInfo = zoneCenters.get(plantZone.id);
          
          if (centerInfo) {
            // Distance from center
            const dist = Math.sqrt(
              Math.pow(plant.latitude - centerInfo.lat, 2) +
              Math.pow(plant.longitude - centerInfo.lng, 2)
            );
            
            // Ratio: 0 at center, 1 at boundary
            // Apply a non-linear (power of 1.8) falloff so the hot center (red/orange) is wider
            const ratio = Math.pow(Math.min(1.0, dist / centerInfo.maxDist), 1.8);
            
            // Heat is highest at center, and fades to cold (0.1) at the boundary of the zone
            weightFactor = zoneBaseWeight * (1.0 - ratio * 0.9);
            weightFactor = Math.max(0.1, Math.min(1.0, weightFactor));
          } else {
            weightFactor = zoneBaseWeight;
          }
        }

        const heatmapColor = getHeatmapColor(weightFactor);
        const radiusHeat = 30 + weightFactor * 15; // 30 to 45 px - large enough to overlap and form continuous lot blobs

        L.circleMarker([plant.latitude, plant.longitude], {
          radius: radiusHeat,
          stroke: false,
          fillColor: heatmapColor,
          fillOpacity: 0.85, // Smooth organic color
          pane: 'heatmapPane',
          renderer: this.heatmapRenderer,
        }).addTo(plantLayers);
      }
    });

    const bounds = L.latLngBounds(
      plants.map((plant) => [plant.latitude, plant.longitude] as [number, number]),
    );

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
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

    const zone = this.availableZones().find((z) => z.id === zoneId);
    if (!zone?.polygon) {
      return;
    }

    this.zonePolygonLayer.addData(zone.polygon);

    const polygonBounds = this.zonePolygonLayer.getBounds();
    if (polygonBounds.isValid()) {
      this.map.fitBounds(polygonBounds, { padding: [48, 48], maxZoom: 18 });
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

function isPointInPolygon(lat: number, lng: number, geom: GeoJSON.Geometry): boolean {
  if (geom.type === 'Polygon') {
    return isPointInCoords([lng, lat], (geom as GeoJSON.Polygon).coordinates);
  } else if (geom.type === 'MultiPolygon') {
    return (geom as GeoJSON.MultiPolygon).coordinates.some((polygonCoords) =>
      isPointInCoords([lng, lat], polygonCoords)
    );
  }
  return false;
}

function isPointInCoords(point: [number, number], coordinates: number[][][]): boolean {
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

    const intersect = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function getHeatmapColor(weightFactor: number): string {
  // weightFactor is between 0.1 and 1.0
  // Maps to Hue: Royal Blue (235) -> Cyan (180) -> Green (120) -> Yellow (60) -> Orange (30) -> Red (0)
  let hue = 235;
  if (weightFactor <= 0.3) {
    const t = (weightFactor - 0.1) / 0.2;
    hue = 235 - t * 55; // 235 to 180
  } else if (weightFactor <= 0.5) {
    const t = (weightFactor - 0.3) / 0.2;
    hue = 180 - t * 60; // 180 to 120
  } else if (weightFactor <= 0.7) {
    const t = (weightFactor - 0.5) / 0.2;
    hue = 120 - t * 60; // 120 to 60
  } else if (weightFactor <= 0.85) {
    const t = (weightFactor - 0.7) / 0.15;
    hue = 60 - t * 30; // 60 to 30
  } else {
    const t = (weightFactor - 0.85) / 0.15;
    hue = 30 - t * 30; // 30 to 0 (pure red)
  }

  // Soft, clear and highly visible colors using HSL with 95% saturation and 60% lightness
  return `hsl(${Math.round(hue)}, 95%, 60%)`;
}

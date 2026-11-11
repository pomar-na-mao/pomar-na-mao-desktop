import { computed, effect, inject, Injectable, signal } from '@angular/core';
import * as L from 'leaflet';
import { OverviewRepository } from '../../../data/repositories/overview/overview-repository';
import type {
  InspectionEntry,
  InspectionOperationResponse,
  InspectionPlant,
  MipdMarking,
  OverviewBoundaryPoint,
  OverviewColoredZone,
  OverviewDiseaseOption,
  OverviewOccurrence,
  OverviewOperationType,
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
export const LIVING_PLANT_COLOR = '#10b981';
export const LIVING_PLANT_STROKE_COLOR = '#047857';
export const NON_EXISTENT_PLANT_COLOR = '#ef4444';
export const NON_EXISTENT_PLANT_STROKE_COLOR = '#b91c1c';
export const OCCURRENCE_HIGHLIGHT_COLOR = '#f97316';
export const OCCURRENCE_HIGHLIGHT_STROKE_COLOR = '#ffffff';
export const MIPD_PLANT_COLOR = '#a855f7';
export const MIPD_PLANT_STROKE_COLOR = '#ffffff';

export interface OverviewPlantStatusPresentation {
  label: 'Viva' | 'Não existente';
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
  private mipdRequestId = 0;
  private operationsRequestId = 0;

  private map: L.Map | null = null;
  private coloredZonesLayer: L.FeatureGroup | null = null;
  private farmPolygonLayer: L.Polygon | null = null;
  private selectedZonePolygonLayer: L.GeoJSON | null = null;
  private plantLayers: L.LayerGroup | null = null;
  private mipdLayers: L.LayerGroup | null = null;
  private inspectionPlantLayers: L.LayerGroup | null = null;
  private plantRenderer = L.canvas({ padding: 0.5 });
  private zoneBoundaryCache = new Map<string, OrderedMapBoundary | null>();
  private zoneBoundaryRequestId = 0;

  public isMapFullscreen = signal(false);
  public summary = signal<OverviewSummary | null>(null);
  public mapPlants = signal<OverviewPlant[]>([]);
  public farmBoundary = signal<OrderedMapBoundary | null>(null);
  public allColoredZones = signal<OverviewColoredZone[]>([]);
  public selectedZoneBoundary = signal<OrderedMapBoundary | null>(null);

  // --- Filter state ---
  public filterPlantingStartDate = signal('');
  public filterPlantingEndDate = signal('');
  public filterZoneId = signal('');
  public selectedOccurrenceIds = signal<string[]>([]);
  public selectedDiseaseIds = signal<string[]>([]);
  public operationStartDate = signal('');
  public operationEndDate = signal('');
  public selectedOperationType = signal<OverviewOperationType>('');
  public filterVarietyId = signal('');
  public filterPlantStatus = signal('');

  // Backward compatibility alias for single occurrence filter
  public filterOccurrenceId = signal('');

  // --- Filter options (loaded from DB) ---
  public availableZones = signal<OverviewZone[]>([]);
  public availableOccurrences = signal<OverviewOccurrence[]>([]);
  public availableDiseases = signal<OverviewDiseaseOption[]>([]);
  public openOccurrences = signal<
    Array<{ plant_id: string; occurrence_type_id: string }>
  >([]);

  // --- MIPD & Operations state ---
  public mipdMarkings = signal<MipdMarking[]>([]);
  public isMipdLoading = signal(false);

  public inspectionOperations = signal<InspectionOperationResponse[]>([]);
  public isOperationsLoading = signal(false);
  public selectedInspectionPlant = signal<InspectionPlant | null>(null);
  public selectedInspectionDetails =
    signal<InspectionOperationResponse | null>(null);
  public inspectionEntriesForPlant = signal<InspectionEntry[]>([]);
  public currentInspectionIndex = signal<number>(0);

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

    // 2. Filter by Plant Status (Planta viva vs não existente)
    const plantStatus = this.filterPlantStatus();
    if (plantStatus === 'alive') {
      plants = plants.filter((plant) => !plant.nonExistent);
    } else if (plantStatus === 'non_existent' || plantStatus === 'nonExistent') {
      plants = plants.filter((plant) => plant.nonExistent);
    }

    // 3. Filter by Zone boundary
    const zoneId = this.filterZoneId();
    if (zoneId) {
      const boundary = this.selectedZoneBoundary();
      if (boundary) {
        plants = plants.filter((plant) =>
          isPointInPolygon(plant.latitude, plant.longitude, boundary.geoJson),
        );
      }
    }

    // 4. Legacy single occurrence filter (for backward compatibility when selectedOccurrenceIds is not set)
    const singleOccId = this.filterOccurrenceId();
    if (singleOccId && this.selectedOccurrenceIds().length === 0) {
      const matchingPlantIds = new Set(
        this.openOccurrences()
          .filter((oc) => oc.occurrence_type_id === singleOccId)
          .map((oc) => oc.plant_id),
      );
      plants = plants.filter((plant) => matchingPlantIds.has(plant.id));
    }

    // NOTE: For multi-selection occurrences, all plants remain visible; highlighting is done at render time.
    return plants;
  });

  public activeOccurrencePlantIds = computed<Set<string>>(() => {
    const selectedIds = this.effectiveSelectedOccurrenceIds();
    if (selectedIds.length === 0) {
      return new Set<string>();
    }

    const selectedSet = new Set(selectedIds);
    const plantIds = new Set<string>();

    for (const occ of this.openOccurrences()) {
      if (selectedSet.has(occ.occurrence_type_id)) {
        plantIds.add(occ.plant_id);
      }
    }

    return plantIds;
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
      this.activeOccurrencePlantIds();
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
      this.allColoredZones();
      this.renderColoredZones();
    });

    effect(() => {
      this.selectedZoneBoundary();
      this.renderSelectedZonePolygon();
    });

    effect(() => {
      if (!this.supportDataLoaded()) {
        return;
      }

      const filters = this.snapshotFilters();
      void this.loadSnapshot(filters);
    });

    // React to MIPD disease selections
    effect(() => {
      const diseaseIds = this.selectedDiseaseIds();
      const zoneId = this.filterZoneId();
      void this.loadMipdMarkings(diseaseIds, zoneId);
    });

    effect(() => {
      this.mipdMarkings();
      this.renderMipdMarkings();
    });

    // React to Operations selection
    effect(() => {
      const opType = this.selectedOperationType();
      const startDate = this.operationStartDate();
      const endDate = this.operationEndDate();
      const zoneId = this.filterZoneId();
      void this.loadOperations(opType, startDate, endDate, zoneId);
    });

    effect(() => {
      this.inspectionOperations();
      this.renderInspectionPlants();
    });

    void this.loadSupportData();
  }

  public effectiveSelectedOccurrenceIds(): string[] {
    const multi = this.selectedOccurrenceIds();
    if (multi.length > 0) {
      return multi;
    }
    const single = this.filterOccurrenceId();
    return single ? [single] : [];
  }

  public async loadOverview(): Promise<void> {
    await this.loadSupportData();
    await this.loadSnapshot(this.snapshotFilters());
  }

  public initMap(elementId: string): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
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

    // Order of layers (bottom to top):
    // 1. All colored zones
    this.coloredZonesLayer = L.featureGroup().addTo(this.map);
    // 2. Farm polygon boundary
    this.farmPolygonLayer = L.polygon([], {
      color: '#2563eb',
      weight: 2.5,
      fillColor: '#60a5fa',
      fillOpacity: 0.05,
    }).addTo(this.map);
    // 3. Selected single zone highlight (if filtered)
    this.selectedZonePolygonLayer = L.geoJSON(undefined, {
      style: {
        color: '#06b6d4',
        weight: 3.5,
        fillColor: '#06b6d4',
        fillOpacity: 0.2,
        dashArray: '6 4',
      },
    }).addTo(this.map);
    // 4. Base plants layer
    this.plantLayers = L.layerGroup().addTo(this.map);
    // 5. MIPD markers layer
    this.mipdLayers = L.layerGroup().addTo(this.map);
    // 6. Inspection operation markers layer
    this.inspectionPlantLayers = L.layerGroup().addTo(this.map);

    this.renderFarmPolygon();
    this.renderColoredZones();
    this.renderPlants();
    this.renderMipdMarkings();
    this.renderInspectionPlants();
    this.renderSelectedZonePolygon();
  }

  public destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.coloredZonesLayer = null;
    this.farmPolygonLayer = null;
    this.selectedZonePolygonLayer = null;
    this.plantLayers = null;
    this.mipdLayers = null;
    this.inspectionPlantLayers = null;
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
    return plant.nonExistent
      ? {
          label: 'Não existente',
          color: NON_EXISTENT_PLANT_COLOR,
          strokeColor: NON_EXISTENT_PLANT_STROKE_COLOR,
        }
      : {
          label: 'Viva',
          color: LIVING_PLANT_COLOR,
          strokeColor: LIVING_PLANT_STROKE_COLOR,
        };
  }

  public fitFarmBounds(): boolean {
    if (!this.map) return false;
    const farmBounds = this.getFarmBounds();
    if (farmBounds && farmBounds.isValid()) {
      this.map.fitBounds(farmBounds, { padding: [48, 48], maxZoom: 18 });
      return true;
    }
    return false;
  }

  private renderPlants(): void {
    const map = this.map;
    const plantLayers = this.plantLayers;

    if (!map || !plantLayers) {
      return;
    }

    plantLayers.clearLayers();

    const plants = this.filteredPlants();
    const occurrencePlantIds = this.activeOccurrencePlantIds();

    if (plants.length === 0) {
      if (!this.fitSelectedZoneBounds()) {
        const farmBounds = this.getFarmBounds();
        if (farmBounds && farmBounds.isValid()) {
          map.fitBounds(farmBounds, { padding: [48, 48], maxZoom: 18 });
        } else {
          map.setView(DEFAULT_CENTER, 16);
        }
      }
      this.bringFarmPolygonToFront();
      return;
    }

    plants.forEach((plant) => {
      const status = this.getPlantStatusPresentation(plant);
      const isHighlighted = occurrencePlantIds.has(plant.id);

      let plantColor = status.color;
      let strokeColor = status.strokeColor;
      let radius = 4.5;
      let weight = 0.75;
      let fillOpacity = 0.9;

      if (isHighlighted) {
        plantColor = OCCURRENCE_HIGHLIGHT_COLOR;
        strokeColor = OCCURRENCE_HIGHLIGHT_STROKE_COLOR;
        radius = 8;
        weight = 2;
        fillOpacity = 1.0;
      }

      const popupTitle = plant.varietyName ?? 'Sem variedade';
      const popupRegistration = plant.nonExistent
        ? '<span style="color: #64748b">Cadastro: Pé inexistente</span><br/>'
        : '';
      const occurrenceBadge = isHighlighted
        ? '<span style="color: #ea580c; font-weight: bold;">Possui ocorrência selecionada</span><br/>'
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
              ${occurrenceBadge}
              ID: ${plant.id}<br/>
              ${plant.latitude.toFixed(6)}, ${plant.longitude.toFixed(6)}
            </div>
          `,
        )
        .addTo(plantLayers);
    });

    // If initial load or reset, zoom to farm
    if (!this.filterZoneId() && !this.selectedOperationType() && occurrencePlantIds.size === 0) {
      this.fitFarmBounds();
    }
    this.bringFarmPolygonToFront();
  }

  private renderColoredZones(): void {
    if (!this.map || !this.coloredZonesLayer) {
      return;
    }

    this.coloredZonesLayer.clearLayers();
    const zones = this.allColoredZones();

    zones.forEach((zone) => {
      if (!zone.boundary) return;

      const layer = L.geoJSON(zone.boundary.geoJson, {
        style: {
          color: zone.color,
          weight: 2,
          fillColor: zone.color,
          fillOpacity: 0.15,
        },
      });

      layer.bindTooltip(
        `<div style="font-size: 11px; font-weight: bold; color: ${zone.color};">${zone.name}</div>`,
        { permanent: false, direction: 'center', opacity: 0.9 },
      );

      layer.addTo(this.coloredZonesLayer!);
    });

    this.bringFarmPolygonToFront();
  }

  private renderMipdMarkings(): void {
    if (!this.map || !this.mipdLayers) {
      return;
    }

    this.mipdLayers.clearLayers();
    const markings = this.mipdMarkings();
    if (markings.length === 0) {
      return;
    }

    const bounds = L.latLngBounds([]);

    markings.forEach((marking) => {
      const marker = L.circleMarker([marking.latitude, marking.longitude], {
        radius: 8,
        color: MIPD_PLANT_STROKE_COLOR,
        fillColor: MIPD_PLANT_COLOR,
        fillOpacity: 0.95,
        weight: 2,
        renderer: this.plantRenderer,
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 170px">
          <strong style="color: #7e22ce;">MIPD: ${marking.occurrence_type_name}</strong><br/>
          Talhão: <strong>${marking.zone_name ?? 'N/A'}</strong><br/>
          Partes: <strong>${marking.plant_parts?.join(', ') || 'N/A'}</strong><br/>
          Data: ${new Date(marking.observed_at).toLocaleDateString('pt-BR')}<br/>
          Planta: ${marking.plant_id}
        </div>
      `);

      marker.addTo(this.mipdLayers!);
      bounds.extend([marking.latitude, marking.longitude]);
    });

    if (bounds.isValid() && this.selectedDiseaseIds().length > 0) {
      this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
    }
  }

  private renderInspectionPlants(): void {
    if (!this.map || !this.inspectionPlantLayers) {
      return;
    }

    this.inspectionPlantLayers.clearLayers();
    const operations = this.inspectionOperations();
    if (operations.length === 0) {
      return;
    }

    const plantMap = new Map<string, InspectionEntry[]>();
    operations.forEach((op) => {
      if (op.plants && op.plants.length > 0) {
        op.plants.forEach((plant) => {
          if (!plantMap.has(plant.plant_id)) {
            plantMap.set(plant.plant_id, []);
          }
          plantMap.get(plant.plant_id)!.push({ operation: op, plant });
        });
      }
    });

    plantMap.forEach((entries) => {
      entries.sort(
        (a, b) =>
          new Date(b.operation.started_at).getTime() -
          new Date(a.operation.started_at).getTime(),
      );
    });

    const bounds = L.latLngBounds([]);

    plantMap.forEach((entries) => {
      const { plant } = entries[0];
      const marker = L.circleMarker([plant.latitude, plant.longitude], {
        radius: 7,
        color: entries.length > 1 ? '#ea580c' : '#f59e0b',
        fillColor: entries.length > 1 ? '#c2410c' : '#d97706',
        fillOpacity: 0.95,
        weight: entries.length > 1 ? 2.5 : 1.5,
        renderer: this.plantRenderer,
      });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        this.inspectionEntriesForPlant.set(entries);
        this.currentInspectionIndex.set(0);
        this.selectedInspectionDetails.set(entries[0].operation);
        this.selectedInspectionPlant.set(entries[0].plant);
      });

      marker.addTo(this.inspectionPlantLayers!);
      bounds.extend([plant.latitude, plant.longitude]);
    });

    if (bounds.isValid()) {
      try {
        this.map.fitBounds(bounds, { padding: [48, 48], maxZoom: 18 });
      } catch {
        // ignore fitBounds failure
      }
    }
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

  private renderSelectedZonePolygon(): void {
    if (!this.selectedZonePolygonLayer || !this.map) {
      return;
    }

    this.selectedZonePolygonLayer.clearLayers();

    const boundary = this.selectedZoneBoundary();
    if (!boundary) {
      return;
    }

    this.selectedZonePolygonLayer.addData(boundary.geoJson);
    this.fitSelectedZoneBounds();
    this.bringFarmPolygonToFront();
  }

  private async loadSupportData(): Promise<void> {
    if (this.supportDataLoaded()) {
      return;
    }

    try {
      const [filterOptions, openOccs, coloredZones] = await Promise.all([
        this.overviewRepository.getFilterOptions(),
        this.overviewRepository.getOpenOccurrences(),
        this.overviewRepository.loadAllColoredZones(),
      ]);

      this.availableZones.set(filterOptions.zones);
      this.availableOccurrences.set(filterOptions.occurrences);
      this.availableDiseases.set(filterOptions.diseases ?? []);
      this.openOccurrences.set(openOccs);
      this.allColoredZones.set(coloredZones);
    } catch (error) {
      console.error('Failed to load overview support data', error);
      this.availableZones.set([]);
      this.availableOccurrences.set([]);
      this.availableDiseases.set([]);
      this.openOccurrences.set([]);
      this.allColoredZones.set([]);
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

      // Auto-fit farm boundary on initial snapshot load
      this.fitFarmBounds();
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

  private async loadMipdMarkings(
    diseaseIds: string[],
    zoneId: string,
  ): Promise<void> {
    const currentId = ++this.mipdRequestId;

    if (!diseaseIds || diseaseIds.length === 0) {
      this.mipdMarkings.set([]);
      this.isMipdLoading.set(false);
      return;
    }

    this.isMipdLoading.set(true);
    try {
      const markings = await this.overviewRepository.getMipdMarkings(
        diseaseIds,
        null,
        null,
        zoneId || null,
      );

      if (currentId === this.mipdRequestId) {
        this.mipdMarkings.set(markings);
      }
    } catch (error) {
      if (currentId === this.mipdRequestId) {
        console.error('Failed to load MIPD markings', error);
        this.mipdMarkings.set([]);
      }
    } finally {
      if (currentId === this.mipdRequestId) {
        this.isMipdLoading.set(false);
      }
    }
  }

  private async loadOperations(
    opType: OverviewOperationType,
    startDate: string,
    endDate: string,
    zoneId: string,
  ): Promise<void> {
    const currentId = ++this.operationsRequestId;

    if (!opType) {
      this.inspectionOperations.set([]);
      this.clearInspectionSelection();
      this.isOperationsLoading.set(false);
      return;
    }

    this.isOperationsLoading.set(true);
    this.clearInspectionSelection();

    try {
      let data: InspectionOperationResponse[] = [];
      if (opType === 'inspecao') {
        data = await this.overviewRepository.getInspectionOperations(
          startDate || null,
          endDate || null,
          zoneId || null,
        );
      } else if (opType === 'ocorrencia') {
        data = await this.overviewRepository.getAnnotationOperations(
          startDate || null,
          endDate || null,
          zoneId || null,
        );
      }

      if (currentId === this.operationsRequestId) {
        this.inspectionOperations.set(data);
      }
    } catch (error) {
      if (currentId === this.operationsRequestId) {
        console.error('Failed to load operations', error);
        this.inspectionOperations.set([]);
      }
    } finally {
      if (currentId === this.operationsRequestId) {
        this.isOperationsLoading.set(false);
      }
    }
  }

  public clearFilters(): void {
    this.filterPlantingStartDate.set('');
    this.filterPlantingEndDate.set('');
    this.filterZoneId.set('');
    this.selectedOccurrenceIds.set([]);
    this.filterOccurrenceId.set('');
    this.selectedDiseaseIds.set([]);
    this.operationStartDate.set('');
    this.operationEndDate.set('');
    this.selectedOperationType.set('');
    this.filterPlantStatus.set('');
    this.filterVarietyId.set('');
    this.clearInspectionSelection();
    this.fitFarmBounds();
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

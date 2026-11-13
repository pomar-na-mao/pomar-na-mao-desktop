import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { PolygonOccurrencesRepository } from '../../../data/repositories/polygon-occurrences/polygon-occurrences.repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { MessageService } from '../../../data/services/message/message.service';
import type {
  PolygonOccurrenceAction,
  PolygonOccurrenceCoordinate,
  PolygonOccurrenceFormValue,
  PolygonOccurrencePayload,
} from '../../../domain/models/polygon-occurrences';
import type { GeoJsonPolygon } from '../../../domain/models/map-polygon.model';
import type { Zone } from '../../../domain/models/zone.model';
import type { SelectOption } from '../../../shared/components/select/select';
import { LoadingService } from '../../../shared/services/loading.service';
import { buildOrderedMapBoundary } from '../../../shared/utils/ordered-map-boundary';
import { toClosedGeoJsonPolygon } from '../../../shared/utils/polygon-geojson';

const ZONE_POLYGON_COLORS = [
  '#0ea5e9', // Azul celeste vibrante
  '#f97316', // Laranja vibrante
  '#ec4899', // Rosa pink vivo
  '#eab308', // Amarelo ouro brilhante
  '#a855f7', // Roxo elétrico
  '#10b981', // Esmeralda brilhante
  '#3b82f6', // Azul royal vivo
  '#ef4444', // Vermelho vivo
  '#14b8a6', // Turquesa vivo
  '#84cc16', // Lima neon
  '#f43f5e', // Carmesim vibrante
  '#8b5cf6', // Violeta intenso
  '#06b6d4', // Ciano vivo
  '#d97706', // Âmbar saturado
  '#c026d3', // Magenta fúcsia
  '#0284c7', // Azul cerúleo brilhante
];

@Injectable({ providedIn: 'root' })
export class PolygonOccurrencesViewModel {
  private formBuilder = inject(FormBuilder);
  private repository = inject(PolygonOccurrencesRepository);
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);
  private plantsRepository = inject(PlantsRepository);
  private farmBoundaryService = inject(FarmBoundaryService);
  private loadingService = inject(LoadingService);
  private messageService = inject(MessageService);

  public selectedZoneId = signal('');
  public isLoadingZones = signal(true);
  public isLoadingOptions = signal(false);
  public isPreviewing = signal(false);
  public isSaving = signal(false);
  public previewLoaded = signal(false);
  public previewError = signal<string | null>(null);
  public clearMapSignal = signal(0);
  public isMapFullscreen = signal(false);
  public lastSaveResult = signal<string | null>(null);
  private formVersion = signal(0);

  public selectedPolygonCoordinates = this.repository.selectedPolygonCoordinates;
  public previewPlants = this.repository.previewPlants;
  public plantsFoundCount = computed(() => this.previewPlants().length);
  public allPlants = this.plantsRepository.allPlants;
  public zones = this.zonesRepository.zones;

  public form = this.formBuilder.group({
    occurrenceAction: this.formBuilder.nonNullable.control<PolygonOccurrenceAction>('add'),
    occurrences: this.formBuilder.nonNullable.control<string[]>([]),
  });

  public zoneOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Nenhuma' },
    ...this.zonesRepository.zones().map((zone) => ({
      value: zone.id,
      label: zone.name,
    })),
  ]);

  public occurrenceOptions = computed<SelectOption[]>(() =>
    this.repository.occurrenceTypeOptions().map((occurrence) => ({
      value: occurrence.id,
      label: occurrence.name,
    })),
  );

  public zonePolygonCoords = signal<[number, number][] | null>(null);
  public farmPolygonCoords = signal<[number, number][] | null>(null);

  public existingZonePolygonEntries = computed(() => {
    const regionPolygons = this.buildRegionPolygonsByZone();

    return this.zones()
      .map((zone) => ({
        zone,
        polygon: regionPolygons.get(zone.id) ?? this.toPolygonCoordinates(zone.polygon),
      }))
      .filter((entry): entry is { zone: Zone; polygon: [number, number][] } => entry.polygon !== null);
  });

  public existingZonePolygons = computed(() =>
    this.existingZonePolygonEntries().map((entry) => entry.polygon),
  );

  public existingZonePolygonLabels = computed(() =>
    this.existingZonePolygonEntries().map((entry) => entry.zone.name),
  );

  public existingZonePolygonColors = computed(() =>
    this.existingZonePolygonEntries().map((_, index) =>
      ZONE_POLYGON_COLORS[index % ZONE_POLYGON_COLORS.length],
    ),
  );

  public existingZonePolygonDashArrays = computed(() =>
    this.existingZonePolygonEntries().map(() => null as string | null),
  );

  public zoneColorMap = computed(() => {
    const map = new Map<string, string>();
    this.existingZonePolygonEntries().forEach((entry, index) => {
      map.set(entry.zone.id, ZONE_POLYGON_COLORS[index % ZONE_POLYGON_COLORS.length]);
    });
    return map;
  });

  public backgroundPolygons = computed<[number, number][][]>(() => {
    const farm = this.farmPolygonCoords();
    return [
      ...(farm ? [farm] : []),
      ...this.existingZonePolygons(),
    ];
  });

  public focusedBackgroundPolygon = computed(
    () => this.zonePolygonCoords() ?? this.farmPolygonCoords(),
  );

  public backgroundPolygonLabels = computed(() => [
    ...(this.farmPolygonCoords() ? [''] : []),
    ...this.existingZonePolygonLabels(),
  ]);

  public backgroundPolygonColors = computed(() => [
    ...(this.farmPolygonCoords() ? ['#ffffff'] : []),
    ...this.existingZonePolygonColors(),
  ]);

  public backgroundPolygonDashArrays = computed<Array<string | null>>(() => [
    ...(this.farmPolygonCoords() ? ['4, 4'] : []),
    ...this.existingZonePolygonDashArrays(),
  ]);

  public backgroundPolygonFillOpacities = computed(() => [
    ...(this.farmPolygonCoords() ? [0] : []),
    ...this.existingZonePolygons().map(() => 0),
  ]);

  public displayPlants = computed(() => {
    const all = this.allPlants();
    const colorMap = this.zoneColorMap();
    const preview = this.previewPlants();
    const isPreview = this.previewLoaded() && preview.length > 0;
    const previewIds = isPreview ? new Set(preview.map((p) => p.plantId)) : null;

    return all.map((plant) => {
      const zoneId = plant.zone_id ?? plant.zoneId;
      const zoneColor = zoneId ? colorMap.get(zoneId) : undefined;

      if (previewIds && previewIds.has(plant.id)) {
        return {
          ...plant,
          strokeColor: '#ffffff',
          fillColor: '#f97316',
        };
      }

      if (zoneColor) {
        return {
          ...plant,
          strokeColor: zoneColor,
          fillColor: zoneColor,
        };
      }

      return plant;
    });
  });

  public canEditForm = computed(() => this.selectedPolygonCoordinates().length >= 3);
  public hasSelectedOccurrences = computed(() => {
    this.formVersion();
    return this.form.controls.occurrences.getRawValue().length > 0;
  });
  public canConfirm = computed(
    () =>
      this.canEditForm()
      && this.previewLoaded()
      && this.plantsFoundCount() > 0
      && this.hasSelectedOccurrences()
      && !this.isSaving(),
  );

  constructor() {
    effect(() => {
      if (this.canEditForm()) this.form.enable({ emitEvent: false });
      else this.form.disable({ emitEvent: false });
    });
    this.form.valueChanges.subscribe(() => this.formVersion.update((value) => value + 1));
    void this.loadFarmBoundary();
  }

  public async loadInitialData(): Promise<void> {
    this.isLoadingZones.set(true);
    this.isLoadingOptions.set(true);
    try {
      const [, , , occurrenceResult] = await Promise.all([
        this.zonesRepository.findAll(),
        this.regionsRepository.findAll(),
        this.plantsRepository.loadAllPlants(),
        this.repository.loadOccurrenceTypeOptions(),
      ]);
      if (occurrenceResult.error) {
        this.messageService.error('Erro ao carregar os tipos de ocorrência.');
      }
    } catch {
      this.messageService.error('Erro ao carregar os dados de ocorrências.');
    } finally {
      this.isLoadingZones.set(false);
      this.isLoadingOptions.set(false);
    }
  }

  public async onZoneChange(value: string | string[]): Promise<void> {
    const zoneId = Array.isArray(value) ? (value[0] ?? '') : value;
    this.selectedZoneId.set(zoneId);

    if (!zoneId) {
      this.zonesRepository.currentZone.set(null);
      this.zonePolygonCoords.set(null);
      return;
    }

    const zone = this.zonesRepository.zones().find((item) => item.id === zoneId) ?? null;
    this.zonesRepository.currentZone.set(zone);
    if (!zone) {
      this.zonePolygonCoords.set(null);
      return;
    }

    const cachedEntry = this.existingZonePolygonEntries().find((e) => e.zone.id === zoneId);
    if (cachedEntry) {
      this.zonePolygonCoords.set(cachedEntry.polygon);
      return;
    }

    const { data, error } = await this.regionsRepository.findByZoneId(zoneId);
    if (error || !data || data.length < 3) {
      this.zonePolygonCoords.set(null);
      return;
    }
    this.zonePolygonCoords.set(data.map((region) => [region.latitude, region.longitude]));
  }

  public onPolygonSelected(coordinates: PolygonOccurrenceCoordinate[]): void {
    if (coordinates.length < 3 || coordinates.some(
      (coordinate) => !Number.isFinite(coordinate.lat) || !Number.isFinite(coordinate.lng),
    )) return;

    this.invalidatePreview();
    this.repository.savePolygonCoordinates(coordinates);
  }

  public onPolygonCleared(): void {
    this.invalidatePreview();
    this.repository.clearPolygon();
  }

  public onOccurrencesChange(value: string | string[]): void {
    this.form.controls.occurrences.setValue(Array.isArray(value) ? value : value ? [value] : []);
  }

  public onOccurrenceActionChange(value: PolygonOccurrenceAction): void {
    this.form.controls.occurrenceAction.setValue(value);
  }

  public clear(): void {
    this.form.reset({ occurrenceAction: 'add', occurrences: [] }, { emitEvent: false });
    this.formVersion.update((value) => value + 1);
    this.onPolygonCleared();
    this.clearMapSignal.update((value) => value + 1);
  }

  public async preview(): Promise<void> {
    if (!this.canEditForm()) return;
    this.isPreviewing.set(true);
    this.previewError.set(null);
    this.repository.clearPreview();

    try {
      const polygon = toClosedGeoJsonPolygon(this.selectedPolygonCoordinates());
      const { data, error } = await this.repository.previewPlantsInsidePolygon(polygon);
      if (error || !data) {
        this.previewLoaded.set(false);
        this.previewError.set('Erro ao buscar plantas dentro do polígono.');
        this.messageService.error('Erro ao buscar plantas dentro do polígono.');
        return;
      }

      this.previewLoaded.set(true);
      if (data.length === 0) {
        this.previewError.set('Nenhuma planta ativa encontrada na área.');
        this.messageService.error('Nenhuma planta ativa encontrada na área.');
      }
    } catch {
      this.previewLoaded.set(false);
      this.previewError.set('Polígono inválido para prévia.');
      this.messageService.error('Polígono inválido para prévia.');
    } finally {
      this.isPreviewing.set(false);
    }
  }

  public async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (!this.canConfirm()) {
      this.messageService.error('Gere uma prévia válida e selecione ao menos uma ocorrência.');
      return;
    }

    this.isSaving.set(true);
    this.loadingService.show('Salvando ocorrências...');
    try {
      const payload = this.buildPayload(this.form.getRawValue() as PolygonOccurrenceFormValue);
      const { data, error } = await this.repository.syncPolygonOccurrences(payload);
      if (error || !data) {
        this.messageService.error('Erro ao salvar as ocorrências da área.');
        return;
      }

      const actionSummary = payload.occurrenceAction === 'add'
        ? `${data.occurrencesCreatedCount} criadas`
        : `${data.occurrencesResolvedCount} resolvidas`;
      const summary = `${data.plantsProcessedCount} plantas processadas, ${actionSummary} e ${data.occurrencesUnchangedCount} sem alteração.`;
      this.messageService.success(`Ocorrências salvas com sucesso: ${summary}`);
      this.clear();
      this.lastSaveResult.set(summary);
    } finally {
      this.isSaving.set(false);
      this.loadingService.hide();
    }
  }

  private buildPayload(value: PolygonOccurrenceFormValue): PolygonOccurrencePayload {
    const validIds = new Set(this.repository.occurrenceTypeOptions().map((option) => option.id));
    const now = new Date().toISOString();
    return {
      polygonGeojson: toClosedGeoJsonPolygon(this.selectedPolygonCoordinates()),
      occurrenceAction: value.occurrenceAction,
      occurrenceTypeIds: [...new Set(value.occurrences.filter((id) => validIds.has(id)))],
      previewPlantsFoundCount: this.plantsFoundCount(),
      zoneId: this.selectedZoneId() || null,
      startedAt: now,
      finishedAt: now,
    };
  }

  private invalidatePreview(): void {
    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.lastSaveResult.set(null);
    this.repository.clearPreview();
  }

  private async loadFarmBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      this.farmPolygonCoords.set(buildOrderedMapBoundary(points)?.latLngs ?? null);
    } catch {
      this.farmPolygonCoords.set(null);
    }
  }

  private toFiniteOrder(value: number | null | undefined): number | null {
    if (value == null) return null;

    const order = Number(value);
    return Number.isFinite(order) ? order : null;
  }

  private buildRegionPolygonsByZone(): Map<string, [number, number][]> {
    const polygons = new Map<string, [number, number][]>();
    const grouped = new Map<
      string,
      Array<{ latitude: number; longitude: number; order: number | null }>
    >();

    this.regionsRepository.regions().forEach((region) => {
      if (!region.zone_id) return;
      if (!Number.isFinite(region.latitude) || !Number.isFinite(region.longitude)) return;

      const points = grouped.get(region.zone_id) ?? [];
      points.push({
        latitude: region.latitude,
        longitude: region.longitude,
        order: this.toFiniteOrder(region.order),
      });
      grouped.set(region.zone_id, points);
    });

    grouped.forEach((points, zoneId) => {
      const orderedPoints = points.filter(
        (point): point is { latitude: number; longitude: number; order: number } =>
          point.order !== null,
      );

      if (orderedPoints.length < 3) return;

      polygons.set(
        zoneId,
        [...orderedPoints]
          .sort((left, right) => left.order - right.order)
          .map((point) => [point.latitude, point.longitude]),
      );
    });

    return polygons;
  }

  private toPolygonCoordinates(
    polygon: Record<string, unknown> | GeoJsonPolygon | null | undefined,
  ): [number, number][] | null {
    if (!polygon || polygon['type'] !== 'Polygon') return null;

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
}

import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { BasicDataRepository } from "../../../data/repositories/basic-data/basic-data.repository";
import { RegionsRepository } from "../../../data/repositories/regions/regions-repository";
import { ZonesRepository } from "../../../data/repositories/zones/zones-repository";
import { FarmBoundaryService } from "../../../data/services/farm-boundary/farm-boundary-service";
import { MessageService } from "../../../data/services/message/message.service";
import type {
    BasicDataCoordinate,
    BasicDataFormData,
    BasicDataFormValue,
    PolygonBulkUpdatePayload,
} from "../../../domain/models/basic-data";
import type { Plant } from "../../../domain/models/plant-data.model";
import type { SelectOption } from "../../../shared/components/select/select";
import { LoadingService } from "../../../shared/services/loading.service";
import { buildOrderedMapBoundary } from "../../../shared/utils/ordered-map-boundary";
import { toClosedGeoJsonPolygon } from "../../../shared/utils/polygon-geojson";

@Injectable({
  providedIn: 'root'
})
export class BasicDataViewModel {
  private formBuilder = inject(FormBuilder);
  private basicDataRepository = inject(BasicDataRepository);
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);
  private farmBoundaryService = inject(FarmBoundaryService);
  public loadingService = inject(LoadingService);
  public messageService = inject(MessageService);

  public selectedZoneId = signal('');
  public isLoadingZones = signal(true);
  public isLoadingOptions = signal(false);
  public isPreviewing = signal(false);
  public isSaving = signal(false);
  public previewLoaded = signal(false);
  public previewError = signal<string | null>(null);
  public clearMapSignal = signal(0);
  public plants = signal<Plant[]>([]);
  public isMapFullscreen = signal(false);
  private formVersion = signal(0);

  public selectedPolygonCoordinates = this.basicDataRepository.selectedPolygonCoordinates;
  public previewPlants = this.basicDataRepository.previewPlants;
  public lastSaveResult = signal<string | null>(null);

  public selectedPlants = computed(() => this.previewPlants().filter((plant) => plant.selected));
  public plantsFoundCount = computed(() => this.previewPlants().length);
  public selectedPlantsCount = computed(() => this.selectedPlants().length);

  public zoneOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Nenhum' },
    ...this.zonesRepository.zones().map((zone) => ({
      value: zone.id,
      label: zone.name,
    }))
  ]);

  public occurrenceOptions = computed<SelectOption[]>(() =>
    this.basicDataRepository.occurrenceTypeOptions().map((occurrence) => ({
      value: occurrence.id,
      label: occurrence.name,
    }))
  );

  public varietyOptions = computed<SelectOption[]>(() => [
    { value: 'none', label: 'Nenhuma' },
    ...this.basicDataRepository.varietyOptions().map((variety) => ({
      value: String(variety.id),
      label: variety.name,
    }))
  ]);

  public zonePolygonCoords = signal<[number, number][] | null>(null);
  public farmPolygonCoords = signal<[number, number][] | null>(null);
  public backgroundPolygons = computed<[number, number][][]>(() => {
    const farm = this.farmPolygonCoords();
    const zone = this.zonePolygonCoords();
    return [farm, zone].filter((polygon): polygon is [number, number][] => !!polygon && polygon.length >= 3);
  });
  public focusedBackgroundPolygon = computed<[number, number][] | null>(
    () => this.zonePolygonCoords() ?? this.farmPolygonCoords(),
  );
  public backgroundPolygonColors = computed<string[]>(() => {
    const colors: string[] = [];
    if (this.farmPolygonCoords()) {
      colors.push('#2563eb');
    }
    if (this.zonePolygonCoords()) {
      colors.push('#f97316');
    }
    return colors;
  });
  public backgroundPolygonDashArrays = computed<Array<string | null>>(() => {
    const dashArrays: Array<string | null> = [];
    if (this.farmPolygonCoords()) {
      dashArrays.push(null);
    }
    if (this.zonePolygonCoords()) {
      dashArrays.push('6, 6');
    }
    return dashArrays;
  });
  public basicDataForm = this.formBuilder.group({
    occurrenceAction: this.formBuilder.nonNullable.control<'add' | 'remove'>('add'),
    occurrences: this.formBuilder.nonNullable.control<string[]>([]),
    variety: this.formBuilder.nonNullable.control<string>('none'),
    lifeOfTree: this.formBuilder.nonNullable.control<string>('', [Validators.maxLength(80)]),
    plantingDate: this.formBuilder.nonNullable.control<string>(''),
    description: this.formBuilder.nonNullable.control<string>('', [Validators.maxLength(500)]),
  });

  public canEditForm = computed(() => this.selectedPolygonCoordinates().length >= 3);

  public hasSelectedChanges = computed(() => {
    this.formVersion();
    const formValue = this.basicDataForm.getRawValue() as BasicDataFormValue;
    return formValue.occurrences.length > 0
      || (formValue.variety !== '' && formValue.variety !== 'none')
      || formValue.lifeOfTree.trim() !== ''
      || formValue.plantingDate !== '';
  });

  public canConfirm = computed(() =>
    this.canEditForm()
    && this.previewLoaded()
    && this.selectedPlantsCount() > 0
    && this.hasSelectedChanges()
    && !this.isSaving()
  );

  public get currentBasicDataFormData(): BasicDataFormData {
    return this.toBasicDataFormData(this.basicDataForm.getRawValue() as BasicDataFormValue);
  }

  constructor() {
    const data = this.basicDataRepository.currentBasicDataFormData();
    this.basicDataForm.patchValue(
      {
        occurrenceAction: data.occurrenceAction,
        occurrences: data.occurrences,
        variety: data.varietyId || 'none',
        lifeOfTree: data.lifeOfTree,
        plantingDate: data.plantingDate,
        description: data.description,
      },
      { emitEvent: false }
    );

    effect(() => {
      const isEnabled = this.canEditForm();
      if (isEnabled) {
        this.basicDataForm.enable({ emitEvent: false });
      } else {
        this.basicDataForm.disable({ emitEvent: false });
      }
    });

    this.basicDataForm.valueChanges.subscribe(() => {
      this.formVersion.update((value) => value + 1);
    });

    void this.loadFarmBoundary();
  }

  public onPolygonSelected(coordinates: BasicDataCoordinate[]): void {
    if (!this.isValidPolygon(coordinates)) {
      return;
    }

    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.lastSaveResult.set(null);
    this.basicDataRepository.savePolygonCoordinates(coordinates);
  }

  public onPolygonCleared(): void {
    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.lastSaveResult.set(null);
    this.basicDataRepository.clearPolygonCoordinates();
  }

  public async loadZones(): Promise<void> {
    this.isLoadingZones.set(true);
    this.isLoadingOptions.set(true);
    try {
      await Promise.all([
        this.zonesRepository.findAll(),
        this.loadBasicDataOptions(),
      ]);
    } finally {
      this.isLoadingZones.set(false);
      this.isLoadingOptions.set(false);
    }
  }

  public async onZoneChange(zoneId: string | string[]): Promise<void> {
    const normalizedZoneId = this.toSingleValue(zoneId);
    this.selectedZoneId.set(normalizedZoneId);

    if (normalizedZoneId === '') {
      this.onPolygonCleared();
      this.clearMapSignal.update((v) => v + 1);
      this.zonesRepository.currentZone.set(null);
      this.plants.set([]);
      this.zonePolygonCoords.set(null);
      return;
    }

    const selectedZone = this.findZoneById(normalizedZoneId);

    if (selectedZone) {
      this.zonesRepository.currentZone.set(selectedZone);
      this.plants.set([]);
      await this.loadZonePolygon(normalizedZoneId);
    } else {
      this.zonesRepository.currentZone.set(null);
      this.plants.set([]);
      this.zonePolygonCoords.set(null);
    }
  }

  private async loadFarmBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      this.farmPolygonCoords.set(buildOrderedMapBoundary(points)?.latLngs ?? null);
    } catch (error) {
      console.error('Failed to load farm boundary for basic data map', error);
      this.farmPolygonCoords.set(null);
    }
  }

  private async loadZonePolygon(zoneId: string): Promise<void> {
    const { data } = await this.regionsRepository.findByZoneId(zoneId);
    if (data && data.length >= 3) {
      this.zonePolygonCoords.set(data.map((r) => [r.latitude, r.longitude]));
    } else {
      this.zonePolygonCoords.set(null);
    }
  }

  public findZoneById(zoneId: string) {
    return this.zonesRepository.zones().find((zone) => zone.id === zoneId);
  }

  public onOccurrencesChange(value: string | string[]): void {
    const nextOccurrences = Array.isArray(value) ? value : value ? [value] : [];
    this.basicDataForm.controls.occurrences.setValue(nextOccurrences);
  }

  public onOccurrenceActionChange(value: 'add' | 'remove'): void {
    this.basicDataForm.controls.occurrenceAction.setValue(value);
  }

  public onVarietyChange(value: string | string[]): void {
    this.basicDataForm.controls.variety.setValue(Array.isArray(value) ? (value[0] ?? '') : value);
  }

  public setPreviewPlantSelected(plantId: string, selected: boolean): void {
    this.basicDataRepository.setPlantSelected(plantId, selected);
  }

  public onClearBasicDataFormDataHandler(): void {
    this.basicDataForm.reset(
      {
        occurrenceAction: 'add',
        occurrences: [],
        variety: 'none',
        lifeOfTree: '',
        plantingDate: '',
        description: '',
      },
      { emitEvent: false }
    );
    this.formVersion.update((value) => value + 1);
    this.previewLoaded.set(false);
    this.previewError.set(null);
    this.lastSaveResult.set(null);
    this.basicDataRepository.clearPreviewPlants();
  }

  public async onPreviewPlantsInsidePolygonHandler(): Promise<void> {
    if (!this.canEditForm()) return;

    this.isPreviewing.set(true);
    this.previewError.set(null);
    this.lastSaveResult.set(null);

    try {
      const polygonGeojson = toClosedGeoJsonPolygon(this.selectedPolygonCoordinates());
      const { error } = await this.basicDataRepository.previewPlantsInsidePolygon(polygonGeojson);

      if (error) {
        this.previewLoaded.set(false);
        this.previewError.set('Erro ao buscar plantas dentro do polígono.');
        this.messageService.error('Erro ao buscar plantas dentro do polígono.');
        return;
      }

      this.previewLoaded.set(true);
    } catch {
      this.previewLoaded.set(false);
      this.previewError.set('Polígono inválido para prévia.');
      this.messageService.error('Polígono inválido para prévia.');
    } finally {
      this.isPreviewing.set(false);
    }
  }

  public async onSaveBasicDataFormDataHandler(): Promise<void> {
    if (!this.canEditForm()) return;

    this.basicDataForm.markAllAsTouched();

    if (this.basicDataForm.invalid) return;

    if (!this.previewLoaded()) {
      this.messageService.error('Gere a prévia das plantas antes de confirmar.');
      return;
    }

    if (this.selectedPlantsCount() === 0) {
      this.messageService.error('Selecione ao menos uma planta para confirmar.');
      return;
    }

    if (!this.hasSelectedChanges()) {
      this.messageService.error('Selecione ao menos uma alteração para confirmar.');
      return;
    }

    const basicDataFormData = this.toBasicDataFormData(this.basicDataForm.getRawValue() as BasicDataFormValue);
    this.basicDataRepository.saveBasicDataFormData(basicDataFormData);

    this.isSaving.set(true);
    this.loadingService.show('Salvando alterações...');
    try {
      const payload = this.buildBulkUpdatePayload(basicDataFormData);
      const { data, error } = await this.basicDataRepository.syncPolygonBulkUpdate(payload);

      if (error || !data) {
        this.messageService.error('Erro ao salvar os dados básicos.');
        return;
      }

      const occurrenceSummary = payload.occurrenceAction === 'remove'
        ? `${data.occurrencesUpdatedCount} ocorrências resolvidas`
        : `${data.occurrencesCreatedCount} ocorrências criadas, ${data.occurrencesUpdatedCount} ocorrências atualizadas`;
      const summary = `${data.plantsChangedCount} plantas alteradas, ${occurrenceSummary} e ${data.attributesUpdatedCount} atributos alterados.`;
      this.messageService.success(`Dados básicos salvos com sucesso: ${summary}`);
      this.onClearBasicDataFormDataHandler();
      this.onPolygonCleared();
      this.lastSaveResult.set(summary);
      this.clearMapSignal.update((v) => v + 1);
    } finally {
      this.isSaving.set(false);
      this.loadingService.hide();
    }
  }

  private async loadBasicDataOptions(): Promise<void> {
    const [varietiesResult, occurrencesResult] = await Promise.all([
      this.basicDataRepository.loadVarietyOptions(),
      this.basicDataRepository.loadOccurrenceTypeOptions(),
    ]);

    if (varietiesResult.error || occurrencesResult.error) {
      this.messageService.error('Erro ao carregar opções de dados básicos.');
    }
  }

  private isValidPolygon(coordinates: BasicDataCoordinate[]): boolean {
    if (coordinates.length < 3) {
      return false;
    }

    return coordinates.every((coordinate) => Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng));
  }

  private toBasicDataFormData(value: BasicDataFormValue): BasicDataFormData {
    return {
      occurrenceAction: value.occurrenceAction,
      occurrences: value.occurrences.filter((occurrence) =>
        this.basicDataRepository.occurrenceTypeOptions().some((option) => option.id === occurrence)
      ),
      varietyId: value.variety,
      lifeOfTree: value.lifeOfTree.trim(),
      plantingDate: value.plantingDate,
      description: value.description.trim(),
    };
  }

  private buildBulkUpdatePayload(data: BasicDataFormData): PolygonBulkUpdatePayload {
    const occurrenceOptions = this.basicDataRepository.occurrenceTypeOptions();
    const now = new Date().toISOString();

    return {
      polygonGeojson: toClosedGeoJsonPolygon(this.selectedPolygonCoordinates()),
      plants: this.selectedPlants().map((plant) => ({
        plantId: plant.plantId,
        selectionSource: plant.selectionSource,
      })),
      plantsFoundCount: this.plantsFoundCount(),
      occurrenceAction: data.occurrenceAction,
      occurrences: data.occurrences
        .map((occurrenceId) => occurrenceOptions.find((option) => option.id === occurrenceId))
        .filter((option): option is NonNullable<typeof option> => Boolean(option))
        .map((option) => ({
          occurrenceTypeId: option.id,
          code: option.code,
          name: option.name,
          notes: data.description || null,
          severity: null,
        })),
      varietyId: (data.varietyId && data.varietyId !== 'none' && data.varietyId !== '') ? Number(data.varietyId) : null,
      lifeOfTree: data.lifeOfTree || null,
      plantingDate: data.plantingDate || null,
      notes: data.description || null,
      startedAt: now,
      finishedAt: now,
      zoneId: this.selectedZoneId() || null,
    };
  }


  private toSingleValue(value: string | string[]): string {
    if (Array.isArray(value)) {
      return value[0] ?? '';
    }

    return value;
  }
}

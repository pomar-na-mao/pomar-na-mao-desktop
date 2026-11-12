import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { VarietiesRepository } from '../../../data/repositories/varieties/varieties-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type {
  GeoJsonPolygon,
  PolygonCoordinate,
} from '../../../domain/models/map-polygon.model';
import type { Variety } from '../../../domain/models/variety.model';
import type { Zone } from '../../../domain/models/zone.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { toClosedGeoJsonPolygon } from '../../../shared/utils/polygon-geojson';
import {
  buildOrderedMapBoundary,
  normalizeOrderedBoundaryPoints,
} from '../../../shared/utils/ordered-map-boundary';
import {
  getVarietyColor,
  UNASSIGNED_VARIETY_COLOR,
  type VarietyColor,
} from '../../../shared/utils/variety-colors';

const ZONE_POLYGON_COLORS = [
  '#0ea5e9',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#84cc16',
  '#3b82f6',
  '#f97316',
  '#06b6d4',
  '#a855f7',
  '#e11d48',
  '#65a30d',
  '#4f46e5',
  '#dc2626',
  '#0891b2',
  '#16a34a',
  '#ca8a04',
  '#c026d3',
  '#0284c7',
  '#db2777',
  '#059669',
  '#d97706',
];

export interface VarietyWithColor {
  variety: Variety;
  color: VarietyColor;
}

@Injectable({
  providedIn: 'root',
})
export class VarietiesViewModel {
  private formBuilder = inject(FormBuilder);
  private varietiesRepository = inject(VarietiesRepository);
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);
  private farmBoundaryService = inject(FarmBoundaryService);
  private plantsRepository = inject(PlantsRepository);
  private loadingService = inject(LoadingService);
  public messageService = inject(MessageService);

  public varieties = this.varietiesRepository.varieties;
  public allPlants = this.plantsRepository.allPlants;

  public isLoading = signal(false);
  public loadFailed = signal(false);
  public isSaving = signal(false);
  public clearMapSignal = signal(0);
  public isMapFullscreen = signal(false);
  public selectedPolygonCoordinates = signal<PolygonCoordinate[]>([]);
  public formVersion = signal(0);
  public saveError = signal<string | null>(null);

  // Modal de Edição (para a mini tabela)
  public editDialogVisible = signal(false);
  public editingVariety = signal<Variety | null>(null);
  public editFormVersion = signal(0);

  // Dados da Fazenda e Zonas no Mapa
  public farmPolygonCoords = signal<[number, number][] | null>(null);
  public farmInitialCenter = signal<[number, number]>([-23.398772, -49.148646]);
  public farmInitialZoom = signal<number>(16);

  public zones = this.zonesRepository.zones;

  public hasPolygon = computed(
    () => this.selectedPolygonCoordinates().length >= 3,
  );

  // Mapeamento de Cores por Variedade
  public varietyColorMap = computed(() => {
    const map = new Map<number, VarietyColor>();
    const list = this.varieties();
    list.forEach((variety, index) => {
      map.set(variety.id, getVarietyColor(index));
    });
    return map;
  });

  public varietiesWithColors = computed<VarietyWithColor[]>(() => {
    const list = this.varieties();
    const colorMap = this.varietyColorMap();
    return list.map((variety) => ({
      variety,
      color: colorMap.get(variety.id) ?? UNASSIGNED_VARIETY_COLOR,
    }));
  });

  // Plantas coloridas para o mapa (uma cor por variedade)
  public mapPlants = computed(() => {
    const plants = this.allPlants();
    const colorMap = this.varietyColorMap();

    return plants.map((plant) => {
      const varietyId =
        plant.varietyId != null
          ? Number(plant.varietyId)
          : plant.variety_id != null
            ? Number(plant.variety_id)
            : null;

      const colors =
        varietyId != null && colorMap.has(varietyId)
          ? colorMap.get(varietyId)!
          : UNASSIGNED_VARIETY_COLOR;

      return {
        ...plant,
        strokeColor: colors.strokeColor,
        fillColor: colors.fillColor,
      };
    });
  });

  // Polígonos de Zonas para o Mapa
  private existingZonePolygonEntries = computed(() => {
    const regionPolygons = this.buildRegionPolygonsByZone();

    return this.zones()
      .map((zone) => ({
        zone,
        polygon:
          regionPolygons.get(zone.id) ?? this.toPolygonCoordinates(zone.polygon),
      }))
      .filter(
        (entry): entry is { zone: Zone; polygon: [number, number][] } =>
          entry.polygon !== null,
      );
  });

  public existingZonePolygons = computed(() =>
    this.existingZonePolygonEntries().map((entry) => entry.polygon),
  );

  public existingZonePolygonLabels = computed(() =>
    this.existingZonePolygonEntries().map((entry) => entry.zone.name),
  );

  public existingZonePolygonColors = computed(() =>
    this.existingZonePolygonEntries().map(
      (_, index) => ZONE_POLYGON_COLORS[index % ZONE_POLYGON_COLORS.length],
    ),
  );

  public mapBackgroundPolygons = computed<[number, number][][]>(() => {
    const farm = this.farmPolygonCoords();
    return [...(farm ? [farm] : []), ...this.existingZonePolygons()];
  });

  public mapBackgroundPolygonLabels = computed(() => [
    ...(this.farmPolygonCoords() ? [''] : []),
    ...this.existingZonePolygonLabels(),
  ]);

  public mapBackgroundPolygonColors = computed(() => [
    ...(this.farmPolygonCoords() ? ['#0f3b8f'] : []),
    ...this.existingZonePolygonColors(),
  ]);

  public mapBackgroundPolygonDashArrays = computed<Array<string | null>>(() => [
    ...(this.farmPolygonCoords() ? [null] : []),
    ...this.existingZonePolygons().map(() => null as string | null),
  ]);

  public mapBackgroundPolygonFillOpacities = computed(() => [
    ...(this.farmPolygonCoords() ? [0] : []),
    ...this.existingZonePolygons().map(() => 0.24),
  ]);

  // Formulário de Criação (Top Sidebar)
  public newVarietyForm = this.formBuilder.group({
    name: this.formBuilder.control(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(120)],
      },
    ),
    description: this.formBuilder.control(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.maxLength(500)],
      },
    ),
  });

  // Formulário de Edição (Dialog)
  public editForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(120),
    ]),
    description: this.formBuilder.nonNullable.control('', [
      Validators.maxLength(500),
    ]),
  });

  public nameError = computed(() => {
    this.formVersion();
    const control = this.newVarietyForm.controls.name;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome da variedade.';
    }
    if (control.hasError('maxlength')) {
      return 'O nome deve ter no máximo 120 caracteres.';
    }
    return null;
  });

  public editNameError = computed(() => {
    this.editFormVersion();
    const control = this.editForm.controls.name;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome da variedade.';
    }
    if (control.hasError('maxlength')) {
      return 'O nome deve ter no máximo 120 caracteres.';
    }
    return null;
  });

  public canSubmitCreate = computed(() => {
    this.formVersion();
    return (
      this.hasPolygon() &&
      !this.isSaving() &&
      this.newVarietyForm.valid &&
      this.newVarietyForm.controls.name.value.trim().length > 0
    );
  });

  public canSubmitEdit = computed(() => {
    this.editFormVersion();
    return (
      !this.isSaving() &&
      this.editForm.valid &&
      this.editForm.controls.name.value.trim().length > 0
    );
  });

  constructor() {
    void this.loadFarmBoundary();

    this.newVarietyForm.valueChanges.subscribe(() => {
      this.formVersion.update((value) => value + 1);
      this.saveError.set(null);
    });

    this.editForm.valueChanges.subscribe(() => {
      this.editFormVersion.update((value) => value + 1);
    });

    // Controla o estado de habilitado/desabilitado do formulário de criação conforme o polígono
    effect(() => {
      const polygonActive = this.hasPolygon();
      const saving = this.isSaving();

      if (!polygonActive || saving) {
        this.newVarietyForm.disable({ emitEvent: false });
      } else {
        this.newVarietyForm.enable({ emitEvent: false });
      }
    });
  }

  public async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.loadFailed.set(false);

    try {
      const [varietiesResult, zonesResult, regionsResult] = await Promise.all([
        this.varietiesRepository.findAll(),
        this.zonesRepository.findAll(),
        this.regionsRepository.findAll(),
        this.plantsRepository.loadAllPlants(),
      ]);

      if (varietiesResult.error) {
        this.loadFailed.set(true);
        this.messageService.error('Erro ao carregar variedades existentes.');
      }

      if (zonesResult.error) {
        this.messageService.error('Erro ao carregar zonas no mapa.');
      }
    } catch {
      this.loadFailed.set(true);
      this.messageService.error('Erro ao carregar dados do catálogo.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public onPolygonSelected(coordinates: PolygonCoordinate[]): void {
    if (coordinates.length < 3 || !this.coordinatesAreFinite(coordinates)) {
      this.selectedPolygonCoordinates.set([]);
      this.newVarietyForm.disable({ emitEvent: false });
      return;
    }

    this.selectedPolygonCoordinates.set(coordinates);
    this.newVarietyForm.enable({ emitEvent: false });
    this.saveError.set(null);
  }

  public onPolygonCleared(): void {
    this.selectedPolygonCoordinates.set([]);
    this.newVarietyForm.disable({ emitEvent: false });
    this.saveError.set(null);
  }

  public clearNewVarietyForm(): void {
    this.newVarietyForm.reset({ name: '', description: '' }, { emitEvent: false });
    this.newVarietyForm.disable({ emitEvent: false });
    this.newVarietyForm.markAsPristine();
    this.newVarietyForm.markAsUntouched();
    this.formVersion.update((v) => v + 1);
    this.selectedPolygonCoordinates.set([]);
    this.clearMapSignal.update((v) => v + 1);
    this.saveError.set(null);
  }

  public async saveNewVariety(): Promise<void> {
    this.newVarietyForm.markAllAsTouched();
    this.formVersion.update((v) => v + 1);

    if (!this.canSubmitCreate()) {
      return;
    }

    const coords = this.selectedPolygonCoordinates();
    if (coords.length < 3) {
      this.saveError.set('Desenhe um polígono no mapa antes de salvar a variedade.');
      return;
    }

    const rawValue = this.newVarietyForm.getRawValue();
    const name = rawValue.name.trim();
    const description = rawValue.description.trim() || null;
    const polygonGeojson: GeoJsonPolygon = toClosedGeoJsonPolygon(coords);

    this.isSaving.set(true);
    this.loadingService.show('Salvando variedade e atribuindo plantas...');
    this.saveError.set(null);

    try {
      const result = await this.varietiesRepository.createWithPlants({
        name,
        description,
        polygonGeojson,
      });

      if (result.error || !result.data) {
        console.error('Erro ao cadastrar variedade e atribuir plantas:', result.error);
        const userFriendlyMsg = 'Erro ao cadastrar variedade e atribuir plantas.';
        this.saveError.set(userFriendlyMsg);
        this.messageService.error(userFriendlyMsg);
        return;
      }

      const count = result.data.plants_updated_count ?? 0;
      this.clearNewVarietyForm();

      // Recarrega as plantas para atualizar as cores no mapa
      await this.plantsRepository.loadAllPlants();

      if (count > 0) {
        this.messageService.success(
          `Variedade “${name}” criada com sucesso e atribuída a ${count} planta(s)!`,
        );
      } else {
        this.messageService.success(
          `Variedade “${name}” criada com sucesso! Nenhuma planta encontrada no polígono.`,
        );
      }
    } catch (error) {
      console.error('Erro inesperado ao cadastrar variedade:', error);
      const userFriendlyMsg = 'Erro ao cadastrar variedade.';
      this.saveError.set(userFriendlyMsg);
      this.messageService.error(userFriendlyMsg);
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  // Ações da Mini Tabela
  public openEdit(variety: Variety): void {
    this.editingVariety.set(variety);
    this.editForm.reset(
      {
        name: variety.name,
        description: variety.description ?? '',
      },
      { emitEvent: false },
    );
    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
    this.editFormVersion.update((v) => v + 1);
    this.editDialogVisible.set(true);
  }

  public closeEditDialog(): void {
    if (this.isSaving()) return;
    this.editDialogVisible.set(false);
    this.editingVariety.set(null);
  }

  public async saveEdit(): Promise<void> {
    this.editForm.markAllAsTouched();
    this.editFormVersion.update((v) => v + 1);

    if (!this.canSubmitEdit()) return;

    const editing = this.editingVariety();
    if (!editing) return;

    const rawValue = this.editForm.getRawValue();
    const payload = {
      name: rawValue.name.trim(),
      description: rawValue.description.trim() || null,
    };

    this.isSaving.set(true);
    this.loadingService.show('Atualizando variedade...');

    try {
      const result = await this.varietiesRepository.update(editing.id, payload);
      if (result.error || !result.data) {
        this.messageService.error('Erro ao editar a variedade.');
        return;
      }

      this.editDialogVisible.set(false);
      this.editingVariety.set(null);
      this.messageService.success('Variedade editada com sucesso.');
    } catch {
      this.messageService.error('Erro ao editar a variedade.');
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  public async deleteVariety(variety: Variety): Promise<void> {
    if (this.isSaving()) return;

    this.isSaving.set(true);
    this.loadingService.show('Excluindo variedade...');

    try {
      const { error } = await this.varietiesRepository.deleteMany([variety.id]);
      if (error) {
        this.messageService.error('Erro ao excluir a variedade.');
        return;
      }

      // Recarrega as plantas para que as árvores sem variedade mudem de cor no mapa
      await this.plantsRepository.loadAllPlants();
      this.messageService.success(
        `Variedade “${variety.name}” excluída com sucesso.`,
      );
    } catch {
      this.messageService.error('Erro ao excluir a variedade.');
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  private async loadFarmBoundary(): Promise<void> {
    try {
      const points = await this.farmBoundaryService.getBoundary();
      this.farmPolygonCoords.set(
        buildOrderedMapBoundary(points)?.latLngs ?? null,
      );

      const normalizedPoints = normalizeOrderedBoundaryPoints(points);
      if (normalizedPoints.length > 0) {
        const lowestPoint =
          normalizedPoints.find((p) => p.order === 1) ?? normalizedPoints[0];
        if (
          lowestPoint &&
          Number.isFinite(lowestPoint.latitude) &&
          Number.isFinite(lowestPoint.longitude)
        ) {
          this.farmInitialCenter.set([
            lowestPoint.latitude,
            lowestPoint.longitude,
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load farm boundary for varieties map', error);
      this.farmPolygonCoords.set(null);
    }
  }

  private buildRegionPolygonsByZone(): Map<string, [number, number][]> {
    const polygons = new Map<string, [number, number][]>();
    const grouped = new Map<
      string,
      Array<{ latitude: number; longitude: number; order: number | null }>
    >();

    this.regionsRepository.regions().forEach((region) => {
      if (!region.zone_id) return;
      if (
        !Number.isFinite(region.latitude) ||
        !Number.isFinite(region.longitude)
      ) {
        return;
      }

      const points = grouped.get(region.zone_id) ?? [];
      points.push({
        latitude: region.latitude,
        longitude: region.longitude,
        order:
          region.order != null && Number.isFinite(Number(region.order))
            ? Number(region.order)
            : null,
      });
      grouped.set(region.zone_id, points);
    });

    grouped.forEach((points, zoneId) => {
      const orderedPoints = points.filter(
        (
          point,
        ): point is { latitude: number; longitude: number; order: number } =>
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

  private coordinatesAreFinite(coordinates: PolygonCoordinate[]): boolean {
    return coordinates.every(
      (coordinate) =>
        Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng),
    );
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

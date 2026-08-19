import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { PolygonCoordinate } from '../../../domain/models/mass-inclusion';
import type {
  CreateZoneWithRegionsPayload,
  Zone,
} from '../../../domain/models/zone.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { toClosedGeoJsonPolygon } from '../../../shared/utils/polygon-geojson';

@Injectable({
  providedIn: 'root',
})
export class ZoneMapManagementViewModel {
  private formBuilder = inject(FormBuilder);
  private zonesRepository = inject(ZonesRepository);
  private regionsRepository = inject(RegionsRepository);
  private loadingService = inject(LoadingService);
  public messageService = inject(MessageService);

  public isLoading = signal(false);
  public zonesLoadFailed = signal(false);
  public regionsLoadFailed = signal(false);
  public isSaving = signal(false);
  public clearMapSignal = signal(0);
  public isMapFullscreen = signal(false);
  public selectedPolygonCoordinates = signal<PolygonCoordinate[]>([]);
  public showExistingZonePolygons = signal(true);
  public savedZoneFocusPolygon = signal<[number, number][] | null>(null);
  public formVersion = signal(0);
  public saveError = signal<string | null>(null);

  public zones = this.zonesRepository.zones;
  public existingZonePolygons = computed(() => {
    if (!this.showExistingZonePolygons()) return [];

    return this.zones()
      .map((zone) => this.toPolygonCoordinates(zone.polygon))
      .filter((polygon): polygon is [number, number][] => polygon !== null);
  });

  public zoneForm = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(120),
    ]),
    code: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(120),
    ]),
    description: this.formBuilder.nonNullable.control('', [
      Validators.maxLength(500),
    ]),
  });

  public nameError = computed(() => {
    this.formVersion();
    const control = this.zoneForm.controls.name;
    const value = control.value.trim();

    if ((control.touched || control.dirty) && value === '') {
      return 'Informe o nome da zona.';
    }

    if (this.isDuplicateZoneName(value, this.zoneForm.controls.code.value)) {
      return 'Ja existe uma zona com este nome.';
    }

    return null;
  });

  public codeError = computed(() => {
    this.formVersion();
    const control = this.zoneForm.controls.code;
    const value = control.value.trim();

    if ((control.touched || control.dirty) && value === '') {
      return 'Informe o codigo da zona.';
    }

    return null;
  });

  public polygonError = computed(() =>
    this.selectedPolygonCoordinates().length < 3
      ? 'Desenhe um polígono com pelo menos 3 pontos.'
      : null,
  );

  public canSave = computed(() => {
    this.formVersion();
    return (
      !this.isSaving() &&
      !this.zonesLoadFailed() &&
      this.zoneForm.valid &&
      !this.nameError() &&
      !this.codeError() &&
      !this.polygonError()
    );
  });

  constructor() {
    this.zoneForm.valueChanges.subscribe(() => {
      this.formVersion.update((value) => value + 1);
      this.saveError.set(null);
    });

    effect(() => {
      if (this.zonesLoadFailed() || this.isSaving()) {
        this.zoneForm.disable({ emitEvent: false });
      } else {
        this.zoneForm.enable({ emitEvent: false });
      }
    });
  }

  public async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.zonesLoadFailed.set(false);
    this.regionsLoadFailed.set(false);

    try {
      const [zonesResult, regionsResult] = await Promise.all([
        this.zonesRepository.findAll(),
        this.regionsRepository.findAll(),
      ]);

      if (zonesResult.error) {
        this.zonesLoadFailed.set(true);
        this.messageService.error('Erro ao carregar zonas existentes.');
      }

      if (regionsResult.error) {
        this.regionsLoadFailed.set(true);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  public onPolygonSelected(coordinates: PolygonCoordinate[]): void {
    if (coordinates.length < 3 || !this.coordinatesAreFinite(coordinates)) {
      this.selectedPolygonCoordinates.set([]);
      return;
    }

    this.selectedPolygonCoordinates.set(coordinates);
    this.saveError.set(null);
  }

  public onPolygonCleared(): void {
    this.selectedPolygonCoordinates.set([]);
    this.showExistingZonePolygons.set(true);
    this.savedZoneFocusPolygon.set(null);
    this.saveError.set(null);
  }

  public clear(): void {
    this.resetFormAndPolygon();
    this.showExistingZonePolygons.set(true);
    this.savedZoneFocusPolygon.set(null);
    this.saveError.set(null);
  }

  public hideExistingZonePolygons(): void {
    this.showExistingZonePolygons.set(false);
    this.savedZoneFocusPolygon.set(null);
  }

  public zonePolygonPointCount(zone: Zone): number {
    return this.toPolygonCoordinates(zone.polygon)?.length ?? 0;
  }

  private resetFormAndPolygon(): void {
    this.zoneForm.reset(
      {
        name: '',
        code: '',
        description: '',
      },
      { emitEvent: false },
    );
    this.formVersion.update((value) => value + 1);
    this.selectedPolygonCoordinates.set([]);
    this.clearMapSignal.update((value) => value + 1);
  }

  public async save(): Promise<void> {
    this.zoneForm.markAllAsTouched();
    this.formVersion.update((value) => value + 1);

    if (!this.canSave()) return;

    this.isSaving.set(true);
    this.loadingService.show('Salvando zona...');
    this.saveError.set(null);

    try {
      const payload = this.buildPayload();
      const { data, message } =
        await this.zonesRepository.createWithRegions(payload);

      if (!data) {
        this.saveError.set(message ?? 'Erro ao salvar a zona no Supabase.');
        return;
      }

      await Promise.all([
        this.zonesRepository.findAll(),
        this.regionsRepository.findAll(),
      ]);

      this.resetFormAndPolygon();
      this.showExistingZonePolygons.set(true);
      this.savedZoneFocusPolygon.set(this.toPolygonCoordinates(data.polygon));
      this.messageService.success('Zona criada com sucesso');
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  private buildPayload(): CreateZoneWithRegionsPayload {
    const value = this.zoneForm.getRawValue();
    const coordinates = this.selectedPolygonCoordinates();
    const name = value.name.trim();
    const code = value.code.trim();

    return {
      name,
      code,
      description: value.description.trim() || null,
      polygonGeojson: toClosedGeoJsonPolygon(coordinates),
      points: coordinates.map((coordinate) => ({
        latitude: coordinate.lat,
        longitude: coordinate.lng,
      })),
    };
  }

  private isDuplicateZoneName(value: string, codeValue = ''): boolean {
    const normalized = value.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return false;

    const normalizedCode = codeValue.trim().toLocaleLowerCase('pt-BR');

    return this.zones().some((zone) => {
      const sameName =
        zone.name.trim().toLocaleLowerCase('pt-BR') === normalized;
      const sameCode =
        !!normalizedCode &&
        (zone.code ?? '').trim().toLocaleLowerCase('pt-BR') === normalizedCode;

      return sameName && !sameCode;
    });
  }

  private coordinatesAreFinite(coordinates: PolygonCoordinate[]): boolean {
    return coordinates.every(
      (coordinate) =>
        Number.isFinite(coordinate.lat) && Number.isFinite(coordinate.lng),
    );
  }

  private toPolygonCoordinates(
    polygon: Record<string, unknown> | GeoJSON.Polygon | null | undefined,
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

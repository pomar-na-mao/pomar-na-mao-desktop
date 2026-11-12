import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import type { FarmBoundaryCoordinate } from '../../../domain/models/farm-boundary.model';
import type { PolygonCoordinate } from '../../../domain/models/map-polygon.model';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { MessageService } from '../../../data/services/message/message.service';
import {
  buildOrderedMapBoundary,
  isValidMapCoordinate,
  normalizeFarmBoundaryCandidate,
} from '../../../shared/utils/ordered-map-boundary';

const DEFAULT_MAP_CENTER: [number, number] = [-23.398772, -49.148646];
const DEFAULT_MAP_ZOOM = 16;
const FOCUSED_MAP_ZOOM = 19;

@Injectable()
export class PropertyDemarcationViewModel {
  private readonly formBuilder = inject(FormBuilder);
  private readonly farmBoundaryService = inject(FarmBoundaryService);
  private readonly messageService = inject(MessageService);

  public readonly persistedBoundary = signal<[number, number][] | null>(null);
  public readonly candidateBoundary = signal<FarmBoundaryCoordinate[]>([]);
  public readonly mapCenter = signal<[number, number]>(DEFAULT_MAP_CENTER);
  public readonly mapZoom = signal(DEFAULT_MAP_ZOOM);
  public readonly clearMapSignal = signal(0);
  public readonly isLoading = signal(false);
  public readonly isSaving = signal(false);
  public readonly coordinateError = signal('');

  public readonly canSave = computed(
    () => this.candidateBoundary().length >= 3 && !this.isSaving(),
  );

  public readonly coordinateForm = this.formBuilder.nonNullable.group({
    latitude: this.formBuilder.nonNullable.control<string | number>('', [
      Validators.required,
    ]),
    longitude: this.formBuilder.nonNullable.control<string | number>('', [
      Validators.required,
    ]),
  });

  public async loadBoundary(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.refreshPersistedBoundary();
    } catch {
      this.messageService.error(
        'Não foi possível carregar a demarcação da propriedade.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  public onPolygonSelected(coordinates: PolygonCoordinate[]): void {
    const normalized = normalizeFarmBoundaryCandidate(coordinates);
    if (!normalized) {
      this.candidateBoundary.set([]);
      this.messageService.error(
        'O polígono precisa de ao menos três pontos distintos e válidos.',
      );
      return;
    }

    this.candidateBoundary.set(normalized);
  }

  public onPolygonCleared(): void {
    this.candidateBoundary.set([]);
  }

  public focusCoordinates(): boolean {
    const latitudeText = String(
      this.coordinateForm.controls.latitude.value,
    ).trim();
    const longitudeText = String(
      this.coordinateForm.controls.longitude.value,
    ).trim();
    const latitude = Number(latitudeText);
    const longitude = Number(longitudeText);

    if (
      latitudeText === '' ||
      longitudeText === '' ||
      !isValidMapCoordinate(latitude, longitude)
    ) {
      this.coordinateError.set(
        'Informe latitude entre -90 e 90 e longitude entre -180 e 180.',
      );
      this.coordinateForm.markAllAsTouched();
      return false;
    }

    this.coordinateError.set('');
    this.mapCenter.set([latitude, longitude]);
    this.mapZoom.set(FOCUSED_MAP_ZOOM);
    return true;
  }

  public async saveBoundary(): Promise<boolean> {
    const candidate = this.candidateBoundary();
    const normalized = normalizeFarmBoundaryCandidate(
      candidate.map((point) => ({ lat: point.latitude, lng: point.longitude })),
    );

    if (!normalized) {
      this.messageService.error(
        'Finalize um polígono com ao menos três pontos distintos antes de salvar.',
      );
      return false;
    }

    this.isSaving.set(true);
    try {
      const insertedCount =
        await this.farmBoundaryService.replaceBoundary(normalized);
      await this.refreshPersistedBoundary();
      this.candidateBoundary.set([]);
      this.clearMapSignal.update((value) => value + 1);
      this.messageService.success(
        `Demarcação salva com ${insertedCount} pontos.`,
      );
      return true;
    } catch {
      this.messageService.error(
        'Não foi possível salvar a demarcação. Revise os pontos e tente novamente.',
      );
      return false;
    } finally {
      this.isSaving.set(false);
    }
  }

  private async refreshPersistedBoundary(): Promise<void> {
    const points = await this.farmBoundaryService.getBoundary();
    const boundary = buildOrderedMapBoundary(points);
    this.persistedBoundary.set(boundary?.latLngs ?? null);
  }
}

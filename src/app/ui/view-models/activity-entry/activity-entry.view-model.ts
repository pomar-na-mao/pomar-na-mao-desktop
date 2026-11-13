import { inject, Injectable, signal } from '@angular/core';
import { ActivityEntryRepository } from '../../../data/repositories/activity-entry/activity-entry.repository';
import { MessageService } from '../../../data/services/message/message.service';
import type {
  ActivityCoordinate,
  ActivityEntryDraft,
  ActivityGeometryType,
  ActivityMapZone,
} from '../../../domain/models/activity-entry.model';
import { validateActivityGeometry } from '../../../domain/models/activity-entry.model';
import type { MachineItem } from '../../../domain/models/machine.model';
import type { MixtureItem } from '../../../domain/models/mixture.model';
import type { PlantMapItem } from '../../../domain/models/plant-data.model';

@Injectable()
export class ActivityEntryViewModel {
  private repository = inject(ActivityEntryRepository);
  private messages = inject(MessageService);

  public loading = signal(true);
  public saving = signal(false);
  public error = signal<string | null>(null);
  public machines = signal<MachineItem[]>([]);
  public mixtures = signal<MixtureItem[]>([]);
  public boundary = signal<Array<{ latitude: number; longitude: number }>>([]);
  public zones = signal<ActivityMapZone[]>([]);
  public plants = signal<PlantMapItem[]>([]);
  public geometryType = signal<ActivityGeometryType>('area');
  public coordinates = signal<ActivityCoordinate[]>([]);
  public clearSignal = signal(0);

  public async initialize(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const catalogs = await this.repository.loadCatalogs();
      this.machines.set(catalogs.machines);
      this.mixtures.set(catalogs.mixtures);
      this.boundary.set(catalogs.boundary);
      this.zones.set(catalogs.zones);
      this.plants.set(catalogs.plants);
    } catch (error) {
      this.error.set(
        toMessage(error, 'Não foi possível carregar máquinas, caldas e mapa.'),
      );
    } finally {
      this.loading.set(false);
    }
  }

  public changeGeometryType(type: ActivityGeometryType): void {
    if (type === this.geometryType()) return;
    this.geometryType.set(type);
    this.coordinates.set([]);
    this.clearSignal.update((value) => value + 1);
  }

  public setCoordinates(coordinates: ActivityCoordinate[]): void {
    this.coordinates.set(coordinates);
  }

  public selectedMachine(id: string): MachineItem | undefined {
    return this.machines().find((machine) => machine.id === id);
  }

  public selectedMixture(id: string): MixtureItem | undefined {
    return this.mixtures().find((mixture) => mixture.id === id);
  }

  public async submit(
    draft: Omit<ActivityEntryDraft, 'geometryType' | 'coordinates'>,
  ): Promise<boolean> {
    if (!draft.activity.trim() || !draft.responsible.trim()) {
      const message = 'Atividade realizada e responsável são obrigatórios.';
      this.error.set(message);
      this.messages.warn(message);
      return false;
    }
    const geometryError = validateActivityGeometry(
      this.geometryType(),
      this.coordinates(),
    );
    if (geometryError) {
      this.error.set(geometryError);
      this.messages.warn(geometryError);
      return false;
    }

    this.saving.set(true);
    this.error.set(null);
    try {
      await this.repository.create({
        ...draft,
        geometryType: this.geometryType(),
        coordinates: this.coordinates(),
      });
      this.messages.success('Atividade registrada com sucesso!');
      this.coordinates.set([]);
      this.clearSignal.update((value) => value + 1);
      return true;
    } catch (error) {
      const message = toMessage(
        error,
        'Não foi possível registrar a atividade.',
      );
      this.error.set(message);
      this.messages.error(message);
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}

function toMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object' && error && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

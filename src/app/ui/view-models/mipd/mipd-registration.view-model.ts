import { computed, inject, Injectable, signal } from '@angular/core';
import { MipdRepository } from '../../../data/repositories/mipd/mipd.repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { MipdPlantPart } from '../../../domain/models/mipd-operation.model';

function localDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localTime(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

@Injectable()
export class MipdRegistrationViewModel {
  private repository = inject(MipdRepository);
  private messageService = inject(MessageService);

  public loading = signal(true);
  public saving = signal(false);
  public error = signal<string | null>(null);

  public zones = computed(() => this.repository.zones());
  public occurrenceTypes = computed(() => this.repository.occurrenceTypes());
  public plants = computed(() => this.repository.plants());

  public selectedZoneId = signal<string>('');
  public selectedPlantId = signal<string>('');
  public selectedOccurrenceTypeId = signal<string>('');
  public selectedPlantParts = signal<MipdPlantPart[]>([]);
  public observedDate = signal<string>(localDate(new Date()));
  public observedTime = signal<string>(localTime(new Date()));

  public selectedPhotoFile = signal<File | null>(null);
  public photoPreviewUrl = signal<string | null>(null);

  public async initialize(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      await Promise.all([
        this.repository.loadZones(),
        this.repository.loadOccurrenceTypes(),
        this.repository.loadPlants(),
      ]);
    } catch (err) {
      this.error.set('Não foi possível carregar os dados iniciais.');
    } finally {
      this.loading.set(false);
    }
  }

  public async onZoneChange(zoneId: string): Promise<void> {
    this.selectedZoneId.set(zoneId);
    this.selectedPlantId.set('');
    await this.repository.loadPlants(zoneId || null);
  }

  public selectPlant(plantId: string): void {
    this.selectedPlantId.set(plantId);
  }

  public togglePlantPart(part: MipdPlantPart): void {
    const current = this.selectedPlantParts();
    if (current.includes(part)) {
      this.selectedPlantParts.set(current.filter((p) => p !== part));
    } else {
      this.selectedPlantParts.set([...current, part]);
    }
  }

  public setPhoto(file: File | null): void {
    if (this.photoPreviewUrl()) {
      URL.revokeObjectURL(this.photoPreviewUrl()!);
      this.photoPreviewUrl.set(null);
    }

    this.selectedPhotoFile.set(file);
    if (file) {
      this.photoPreviewUrl.set(URL.createObjectURL(file));
    }
  }

  public removePhoto(): void {
    this.setPhoto(null);
  }

  public resetForm(): void {
    this.selectedPlantId.set('');
    this.selectedOccurrenceTypeId.set('');
    this.selectedPlantParts.set([]);
    this.observedDate.set(localDate(new Date()));
    this.observedTime.set(localTime(new Date()));
    this.removePhoto();
    this.error.set(null);
  }

  public async submit(): Promise<boolean> {
    if (!this.selectedPlantId()) {
      this.messageService.error('Selecione uma planta.');
      return false;
    }

    if (!this.selectedOccurrenceTypeId()) {
      this.messageService.error('Selecione a praga ou doença.');
      return false;
    }

    if (this.selectedPlantParts().length === 0) {
      this.messageService.error('Selecione pelo menos uma parte da planta afetada.');
      return false;
    }

    const observedAt = new Date(
      `${this.observedDate()}T${this.observedTime()}:00`,
    );
    if (Number.isNaN(observedAt.getTime())) {
      this.messageService.error('Data ou hora da observação inválida.');
      return false;
    }

    this.saving.set(true);
    this.error.set(null);

    try {
      const res = await this.repository.submitMarking({
        plantId: this.selectedPlantId(),
        occurrenceTypeId: this.selectedOccurrenceTypeId(),
        plantParts: this.selectedPlantParts(),
        observedAt: observedAt.toISOString(),
        photoFile: this.selectedPhotoFile(),
      });

      if (!res.success) {
        this.error.set(res.error || 'Erro ao registrar marcação MIPD.');
        this.messageService.error(res.error || 'Erro ao salvar marcação.');
        return false;
      }

      this.messageService.success('Marcação de MIPD registrada com sucesso!');
      this.resetForm();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error.set(msg);
      this.messageService.error(msg);
      return false;
    } finally {
      this.saving.set(false);
    }
  }
}

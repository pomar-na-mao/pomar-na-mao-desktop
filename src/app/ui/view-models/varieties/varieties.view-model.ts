import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { VarietiesRepository } from '../../../data/repositories/varieties/varieties-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { Variety } from '../../../domain/models/variety.model';
import { LoadingService } from '../../../shared/services/loading.service';

@Injectable({ providedIn: 'root' })
export class VarietiesViewModel {
  private formBuilder = inject(FormBuilder);
  private varietiesRepository = inject(VarietiesRepository);
  private messageService = inject(MessageService);
  private loadingService = inject(LoadingService);

  public varieties = this.varietiesRepository.varieties;
  public isLoading = signal(false);
  public loadFailed = signal(false);
  public isSaving = signal(false);
  public dialogVisible = signal(false);
  public editingVariety = signal<Variety | null>(null);
  public selectedVarieties = signal<Variety[]>([]);
  public formVersion = signal(0);

  public form = this.formBuilder.group({
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
    const control = this.form.controls.name;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome da variedade.';
    }
    if (control.hasError('maxlength')) {
      return 'O nome deve ter no máximo 120 caracteres.';
    }
    return null;
  });

  public canSubmit = computed(() => {
    this.formVersion();
    return (
      !this.isSaving() &&
      this.form.valid &&
      this.form.controls.name.value.trim().length > 0
    );
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.formVersion.update((value) => value + 1);
    });
  }

  public async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    try {
      const { error } = await this.varietiesRepository.findAll();
      if (error) {
        this.loadFailed.set(true);
        this.messageService.error('Erro ao carregar as variedades.');
      }
    } catch {
      this.loadFailed.set(true);
      this.messageService.error('Erro ao carregar as variedades.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreate(): void {
    this.editingVariety.set(null);
    this.resetForm('', '');
    this.dialogVisible.set(true);
  }

  public openEdit(variety: Variety): void {
    this.editingVariety.set(variety);
    this.resetForm(variety.name, variety.description ?? '');
    this.dialogVisible.set(true);
  }

  public closeDialog(): void {
    if (this.isSaving()) return;
    this.dialogVisible.set(false);
    this.editingVariety.set(null);
    this.resetForm('', '');
  }

  public async save(): Promise<void> {
    this.form.markAllAsTouched();
    this.formVersion.update((value) => value + 1);
    if (!this.canSubmit()) return;

    const editing = this.editingVariety();
    const rawValue = this.form.getRawValue();
    const payload = {
      name: rawValue.name.trim(),
      description: rawValue.description.trim() || null,
    };

    this.isSaving.set(true);
    this.loadingService.show(
      editing ? 'Atualizando variedade...' : 'Adicionando variedade...',
    );

    try {
      const result = editing
        ? await this.varietiesRepository.update(editing.id, payload)
        : await this.varietiesRepository.create(payload);

      if (result.error || !result.data) {
        this.messageService.error(
          editing
            ? 'Erro ao editar a variedade.'
            : 'Erro ao adicionar a variedade.',
        );
        return;
      }

      this.dialogVisible.set(false);
      this.editingVariety.set(null);
      this.resetForm('', '');
      this.messageService.success(
        editing
          ? 'Variedade editada com sucesso.'
          : 'Variedade adicionada com sucesso.',
      );
    } catch {
      this.messageService.error(
        editing
          ? 'Erro ao editar a variedade.'
          : 'Erro ao adicionar a variedade.',
      );
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  public async deleteVarieties(varieties: Variety[]): Promise<void> {
    if (varieties.length === 0 || this.isSaving()) return;

    this.isSaving.set(true);
    this.loadingService.show(
      varieties.length === 1
        ? 'Excluindo variedade...'
        : 'Excluindo variedades...',
    );

    try {
      const ids = varieties.map((variety) => variety.id);
      const { error } = await this.varietiesRepository.deleteMany(ids);
      if (error) {
        this.messageService.error(
          varieties.length === 1
            ? 'Erro ao excluir a variedade.'
            : 'Erro ao excluir as variedades.',
        );
        return;
      }

      const deletedIds = new Set(ids);
      this.selectedVarieties.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
      this.messageService.success(
        varieties.length === 1
          ? 'Variedade excluída com sucesso.'
          : 'Variedades excluídas com sucesso.',
      );
    } catch {
      this.messageService.error(
        varieties.length === 1
          ? 'Erro ao excluir a variedade.'
          : 'Erro ao excluir as variedades.',
      );
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  private resetForm(name: string, description: string): void {
    this.form.reset({ name, description }, { emitEvent: false });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formVersion.update((value) => value + 1);
  }
}

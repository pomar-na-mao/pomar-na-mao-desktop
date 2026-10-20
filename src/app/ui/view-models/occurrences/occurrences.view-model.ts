import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import type { PostgrestError } from '@supabase/supabase-js';
import { OccurrenceTypesRepository } from '../../../data/repositories/occurrence-types/occurrence-types.repository';
import { MessageService } from '../../../data/services/message/message.service';
import type {
  OccurrenceCategory,
  OccurrenceType,
} from '../../../domain/models/occurrence-type.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { occurrenceCodeFromName } from '../../../shared/utils/occurrence-code';
import {
  OCCURRENCE_CATEGORY_OPTIONS,
  occurrenceCategoryLabel,
} from '../../../shared/utils/occurrence-category';

@Injectable({ providedIn: 'root' })
export class OccurrencesViewModel {
  private formBuilder = inject(FormBuilder);
  private occurrenceTypesRepository = inject(OccurrenceTypesRepository);
  private messageService = inject(MessageService);
  private loadingService = inject(LoadingService);

  public occurrenceTypes = this.occurrenceTypesRepository.occurrenceTypes;
  public isLoading = signal(false);
  public loadFailed = signal(false);
  public isSaving = signal(false);
  public dialogVisible = signal(false);
  public editingOccurrenceType = signal<OccurrenceType | null>(null);
  public selectedOccurrenceTypes = signal<OccurrenceType[]>([]);
  public formVersion = signal(0);
  public categoryOptions = OCCURRENCE_CATEGORY_OPTIONS;
  public categoryLabel = occurrenceCategoryLabel;

  public form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(120),
    ]),
    category: this.formBuilder.control<OccurrenceCategory | null>(null, [
      Validators.required,
    ]),
  });

  public nameError = computed(() => {
    this.formVersion();
    const control = this.form.controls.name;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome da ocorrência.';
    }
    if (control.hasError('maxlength')) {
      return 'O nome deve ter no máximo 120 caracteres.';
    }
    return null;
  });

  public categoryError = computed(() => {
    this.formVersion();
    const control = this.form.controls.category;
    if ((control.touched || control.dirty) && control.hasError('required')) {
      return 'Selecione a categoria da ocorrência.';
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
      const { error } = await this.occurrenceTypesRepository.findAll();
      if (error) {
        this.loadFailed.set(true);
        this.messageService.error('Erro ao carregar as ocorrências.');
      }
    } catch {
      this.loadFailed.set(true);
      this.messageService.error('Erro ao carregar as ocorrências.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreate(): void {
    this.editingOccurrenceType.set(null);
    this.resetForm('', null);
    this.dialogVisible.set(true);
  }

  public openEdit(occurrenceType: OccurrenceType): void {
    this.editingOccurrenceType.set(occurrenceType);
    this.resetForm(occurrenceType.name, occurrenceType.category);
    this.dialogVisible.set(true);
  }

  public closeDialog(): void {
    if (this.isSaving()) return;
    this.dialogVisible.set(false);
    this.editingOccurrenceType.set(null);
    this.resetForm('', null);
  }

  public async save(): Promise<void> {
    this.form.markAllAsTouched();
    this.formVersion.update((value) => value + 1);
    if (!this.canSubmit()) return;

    const editing = this.editingOccurrenceType();
    const rawValue = this.form.getRawValue();
    if (!rawValue.category) return;
    const name = rawValue.name.trim();
    const payload = {
      name,
      code: editing?.code ?? occurrenceCodeFromName(name),
      category: rawValue.category,
    };

    this.isSaving.set(true);
    this.loadingService.show(
      editing ? 'Atualizando ocorrência...' : 'Adicionando ocorrência...',
    );

    try {
      const result = editing
        ? await this.occurrenceTypesRepository.update(editing.id, payload)
        : await this.occurrenceTypesRepository.create(payload);

      if (result.error || !result.data) {
        this.messageService.error(
          this.mutationErrorMessage(result.error, editing),
        );
        return;
      }

      this.dialogVisible.set(false);
      this.editingOccurrenceType.set(null);
      this.resetForm('', null);
      this.messageService.success(
        editing
          ? 'Ocorrência editada com sucesso.'
          : 'Ocorrência adicionada com sucesso.',
      );
    } catch {
      this.messageService.error(
        editing
          ? 'Erro ao editar a ocorrência.'
          : 'Erro ao adicionar a ocorrência.',
      );
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  public async deleteOccurrenceTypes(
    occurrenceTypes: OccurrenceType[],
  ): Promise<void> {
    if (occurrenceTypes.length === 0 || this.isSaving()) return;

    this.isSaving.set(true);
    this.loadingService.show(
      occurrenceTypes.length === 1
        ? 'Excluindo ocorrência...'
        : 'Excluindo ocorrências...',
    );

    try {
      const ids = occurrenceTypes.map((occurrenceType) => occurrenceType.id);
      const { error } = await this.occurrenceTypesRepository.deleteMany(ids);
      if (error) {
        this.messageService.error(
          occurrenceTypes.length === 1
            ? 'Não foi possível excluir a ocorrência. Ela pode estar em uso.'
            : 'Não foi possível excluir as ocorrências. Uma delas pode estar em uso.',
        );
        return;
      }

      const deletedIds = new Set(ids);
      this.selectedOccurrenceTypes.update((items) =>
        items.filter((item) => !deletedIds.has(item.id)),
      );
      this.messageService.success(
        occurrenceTypes.length === 1
          ? 'Ocorrência excluída com sucesso.'
          : 'Ocorrências excluídas com sucesso.',
      );
    } catch {
      this.messageService.error(
        occurrenceTypes.length === 1
          ? 'Erro ao excluir a ocorrência.'
          : 'Erro ao excluir as ocorrências.',
      );
    } finally {
      this.loadingService.hide();
      this.isSaving.set(false);
    }
  }

  private mutationErrorMessage(
    error: PostgrestError | null,
    editing: OccurrenceType | null,
  ): string {
    if (error?.code === '23505') {
      return 'Já existe uma ocorrência com este código.';
    }

    return editing
      ? 'Erro ao editar a ocorrência.'
      : 'Erro ao adicionar a ocorrência.';
  }

  private resetForm(name: string, category: OccurrenceCategory | null): void {
    this.form.reset({ name, category }, { emitEvent: false });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formVersion.update((value) => value + 1);
  }
}

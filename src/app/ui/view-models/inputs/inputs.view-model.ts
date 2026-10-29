import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InputsRepository } from '../../../data/repositories/inputs/inputs.repository';
import { MessageService } from '../../../data/services/message/message.service';
import {
  type InputDraft,
  type InputItem,
  inputTypeBadgeStyle,
  inputTypeLabel,
} from '../../../domain/models/input.model';
import { LoadingService } from '../../../shared/services/loading.service';

@Injectable({ providedIn: 'root' })
export class InputsViewModel {
  private formBuilder = inject(FormBuilder);
  private inputsRepository = inject(InputsRepository);
  private messageService = inject(MessageService);
  private loadingService = inject(LoadingService);

  public inputs = this.inputsRepository.inputs;
  public availableTypes = this.inputsRepository.availableTypes;

  public isLoading = signal(false);
  public loadFailed = signal(false);
  public isSaving = signal(false);
  public isSavingType = signal(false);

  public dialogVisible = signal(false);
  public typeDialogVisible = signal(false);
  public detailsDialogVisible = signal(false);

  public editingInput = signal<InputItem | null>(null);
  public selectedInputForDetails = signal<InputItem | null>(null);
  public selectedInputs = signal<InputItem[]>([]);

  public formVersion = signal(0);
  public typeFormVersion = signal(0);

  public typeLabel = inputTypeLabel;
  public typeBadgeStyle = inputTypeBadgeStyle;

  public typeOptions = computed(() => {
    return this.availableTypes().map((type) => ({
      label: inputTypeLabel(type),
      value: type,
    }));
  });

  public form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(150),
    ]),
    type: this.formBuilder.nonNullable.control('', [Validators.required]),
    active_ingredient: this.formBuilder.control<string | null>(null),
    formulation: this.formBuilder.control<string | null>(null),
    concentration: this.formBuilder.control<string | null>(null),
    chemical_group: this.formBuilder.control<string | null>(null),
    manufacturer: this.formBuilder.control<string | null>(null),
    mapa_registration: this.formBuilder.control<string | null>(null),
    expiration_date: this.formBuilder.control<string | null>(null),
    registered_for_crop: this.formBuilder.nonNullable.control(true),
    target_1: this.formBuilder.control<string | null>(null),
    target_2: this.formBuilder.control<string | null>(null),
    safety_interval_days: this.formBuilder.control<number | null>(null, [
      Validators.min(0),
    ]),
    label_dose: this.formBuilder.control<string | null>(null),
    dose_unit: this.formBuilder.control<string | null>(null),
    observations: this.formBuilder.control<string | null>(null),
  });

  public typeForm = this.formBuilder.group({
    typeName: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(50),
      Validators.pattern(/^[A-Za-z0-9_ -]+$/),
    ]),
  });

  public nameError = computed(() => {
    this.formVersion();
    const control = this.form.controls.name;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome do insumo.';
    }
    if (control.hasError('maxlength')) {
      return 'O nome deve ter no máximo 150 caracteres.';
    }
    return null;
  });

  public typeError = computed(() => {
    this.formVersion();
    const control = this.form.controls.type;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Selecione o tipo do insumo.';
    }
    return null;
  });

  public newTypeError = computed(() => {
    this.typeFormVersion();
    const control = this.typeForm.controls.typeName;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome do tipo.';
    }
    if (control.hasError('pattern')) {
      return 'Use apenas letras, números e underline.';
    }
    return null;
  });

  public canSubmit = computed(() => {
    this.formVersion();
    return (
      !this.isSaving() &&
      this.form.valid &&
      this.form.controls.name.value.trim().length > 0 &&
      this.form.controls.type.value.trim().length > 0
    );
  });

  public canSubmitType = computed(() => {
    this.typeFormVersion();
    return (
      !this.isSavingType() &&
      this.typeForm.valid &&
      this.typeForm.controls.typeName.value.trim().length > 0
    );
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.formVersion.update((value) => value + 1);
    });
    this.typeForm.valueChanges.subscribe(() => {
      this.typeFormVersion.update((value) => value + 1);
    });
  }

  public async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    try {
      await Promise.all([
        this.inputsRepository.findAll(),
        this.inputsRepository.loadEnumValues(),
      ]);
    } catch {
      this.loadFailed.set(true);
      this.messageService.error('Erro ao carregar os insumos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreate(): void {
    this.editingInput.set(null);
    this.resetForm();
    this.dialogVisible.set(true);
  }

  public openEdit(input: InputItem): void {
    this.editingInput.set(input);
    this.form.setValue({
      name: input.name,
      type: input.type,
      active_ingredient: input.active_ingredient ?? '',
      formulation: input.formulation ?? '',
      concentration: input.concentration ?? '',
      chemical_group: input.chemical_group ?? '',
      manufacturer: input.manufacturer ?? '',
      mapa_registration: input.mapa_registration ?? '',
      expiration_date: input.expiration_date ?? '',
      registered_for_crop: input.registered_for_crop ?? true,
      target_1: input.target_1 ?? '',
      target_2: input.target_2 ?? '',
      safety_interval_days: input.safety_interval_days ?? null,
      label_dose: input.label_dose ?? '',
      dose_unit: input.dose_unit ?? '',
      observations: input.observations ?? '',
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.dialogVisible.set(true);
  }

  public openDetails(input: InputItem): void {
    this.selectedInputForDetails.set(input);
    this.detailsDialogVisible.set(true);
  }

  public closeDetails(): void {
    this.detailsDialogVisible.set(false);
    this.selectedInputForDetails.set(null);
  }

  public openCreateType(): void {
    this.typeForm.reset({ typeName: '' });
    this.typeForm.markAsPristine();
    this.typeForm.markAsUntouched();
    this.typeDialogVisible.set(true);
  }

  public closeTypeDialog(): void {
    this.typeDialogVisible.set(false);
  }

  public closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingInput.set(null);
    this.resetForm();
  }

  public async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    this.isSaving.set(true);
    this.loadingService.show(
      this.editingInput() ? 'Atualizando insumo...' : 'Cadastrando insumo...',
    );

    const raw = this.form.getRawValue();
    const draft: InputDraft = {
      name: raw.name.trim(),
      type: raw.type.trim(),
      active_ingredient: raw.active_ingredient?.trim() || null,
      formulation: raw.formulation?.trim() || null,
      concentration: raw.concentration?.trim() || null,
      chemical_group: raw.chemical_group?.trim() || null,
      manufacturer: raw.manufacturer?.trim() || null,
      mapa_registration: raw.mapa_registration?.trim() || null,
      expiration_date: raw.expiration_date?.trim() || null,
      registered_for_crop: raw.registered_for_crop,
      target_1: raw.target_1?.trim() || null,
      target_2: raw.target_2?.trim() || null,
      safety_interval_days:
        raw.safety_interval_days !== null && raw.safety_interval_days !== undefined
          ? Number(raw.safety_interval_days)
          : null,
      label_dose: raw.label_dose?.trim() || null,
      dose_unit: raw.dose_unit?.trim() || null,
      observations: raw.observations?.trim() || null,
    };

    try {
      const editing = this.editingInput();
      if (editing) {
        const { error } = await this.inputsRepository.update(editing.id, draft);
        if (error) {
          this.messageService.error('Erro ao atualizar insumo.');
          return;
        }
        this.messageService.success('Insumo atualizado com sucesso.');
      } else {
        const { error } = await this.inputsRepository.create(draft);
        if (error) {
          this.messageService.error('Erro ao cadastrar insumo.');
          return;
        }
        this.messageService.success('Insumo cadastrado com sucesso.');
      }
      this.closeDialog();
    } catch {
      this.messageService.error('Erro ao salvar insumo.');
    } finally {
      this.isSaving.set(false);
      this.loadingService.hide();
    }
  }

  public async submitType(): Promise<void> {
    if (!this.canSubmitType()) return;

    this.isSavingType.set(true);
    const newTypeName = this.typeForm.controls.typeName.value
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');

    try {
      const { error } = await this.inputsRepository.addEnumValue(newTypeName);
      if (error) {
        this.messageService.error(
          `Erro ao adicionar tipo no enum: ${error.message}`,
        );
        return;
      }
      this.messageService.success(
        `Tipo “${newTypeName}” adicionado ao enum com sucesso.`,
      );
      this.form.controls.type.setValue(newTypeName);
      this.closeTypeDialog();
    } catch {
      this.messageService.error('Erro ao adicionar tipo no banco de dados.');
    } finally {
      this.isSavingType.set(false);
    }
  }

  public async deleteInputs(items: InputItem[]): Promise<void> {
    if (items.length === 0) return;

    this.isSaving.set(true);
    this.loadingService.show(
      items.length === 1 ? 'Excluindo insumo...' : 'Excluindo insumos...',
    );

    try {
      const ids = items.map((i) => i.id);
      const { error } = await this.inputsRepository.deleteMany(ids);
      if (error) {
        this.messageService.error('Erro ao excluir insumo(s).');
        return;
      }
      this.selectedInputs.update((selected) =>
        selected.filter((item) => !ids.includes(item.id)),
      );
      this.messageService.success('Insumo(s) excluído(s) com sucesso.');
    } catch {
      this.messageService.error('Erro ao excluir insumo(s).');
    } finally {
      this.isSaving.set(false);
      this.loadingService.hide();
    }
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      type: '',
      active_ingredient: '',
      formulation: '',
      concentration: '',
      chemical_group: '',
      manufacturer: '',
      mapa_registration: '',
      expiration_date: '',
      registered_for_crop: true,
      target_1: '',
      target_2: '',
      safety_interval_days: null,
      label_dose: '',
      dose_unit: '',
      observations: '',
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}

import { computed, inject, Injectable, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { InputsRepository } from '../../../data/repositories/inputs/inputs.repository';
import { MixturesRepository } from '../../../data/repositories/mixtures/mixtures.repository';
import { UsersRepository } from '../../../data/repositories/users/users-repository';
import { MessageService } from '../../../data/services/message/message.service';
import {
  INPUT_TYPE_TRANSLATION_MAP,
  inputTypeBadgeStyle,
  inputTypeLabel,
} from '../../../domain/models/input.model';
import {
  type MixtureDraft,
  type MixtureInputDraft,
  type MixtureItem,
  mixtureStatusBadgeStyle,
} from '../../../domain/models/mixture.model';
import { LoadingService } from '../../../shared/services/loading.service';

export interface MixtureInputFormGroup {
  input_id: string;
  dose: string;
  dose_unit: string | null;
  input_name?: string;
}

@Injectable({ providedIn: 'root' })
export class MixturesViewModel {
  private formBuilder = inject(FormBuilder);
  private mixturesRepository = inject(MixturesRepository);
  private inputsRepository = inject(InputsRepository);
  private usersRepository = inject(UsersRepository);
  private authenticationRepository = inject(AuthenticationRepository);
  private messageService = inject(MessageService);
  private loadingService = inject(LoadingService);

  public mixtures = this.mixturesRepository.mixtures;
  public availableInputs = this.inputsRepository.inputs;

  public isLoading = signal(false);
  public loadFailed = signal(false);
  public isSaving = signal(false);

  public dialogVisible = signal(false);
  public detailsDialogVisible = signal(false);

  public editingMixture = signal<MixtureItem | null>(null);
  public selectedMixtureForDetails = signal<MixtureItem | null>(null);
  public selectedMixtures = signal<MixtureItem[]>([]);

  public formVersion = signal(0);
  public statusBadgeStyle = mixtureStatusBadgeStyle;
  public inputTypeTranslationMap = INPUT_TYPE_TRANSLATION_MAP;
  public inputTypeLabel = inputTypeLabel;
  public inputTypeBadgeStyle = inputTypeBadgeStyle;

  public translateInputType(type: string | null | undefined): string {
    if (!type) return 'Não especificado';
    const upper = type.toUpperCase().trim();
    return this.inputTypeTranslationMap[upper] ?? inputTypeLabel(type);
  }

  public inputOptions = computed(() => {
    return this.availableInputs().map((input) => {
      const typeLabel = this.translateInputType(input.type);
      return {
        label: `${input.name} (${typeLabel})`,
        value: input.id,
        typeLabel,
        input,
      };
    });
  });

  public form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(150),
    ]),
    is_active: this.formBuilder.nonNullable.control(true),
    observations: this.formBuilder.control<string | null>(null),
    inputs: this.formBuilder.array<FormGroup>([]),
  });

  public get inputsArray(): FormArray {
    return this.form.get('inputs') as FormArray;
  }

  public nameError = computed(() => {
    this.formVersion();
    const control = this.form.controls.name;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome da calda.';
    }
    if (control.hasError('maxlength')) {
      return 'O nome deve ter no máximo 150 caracteres.';
    }
    return null;
  });

  public inputsError = computed(() => {
    this.formVersion();
    const arr = this.inputsArray;
    if (arr.length === 0) {
      return 'Adicione pelo menos 1 insumo à calda.';
    }
    for (let i = 0; i < arr.length; i++) {
      const g = arr.at(i) as FormGroup;
      const inputIdCtrl = g.get('input_id');
      const doseCtrl = g.get('dose');
      if (!inputIdCtrl?.value) {
        return `Selecione o insumo no item ${i + 1}.`;
      }
      if (!doseCtrl?.value || doseCtrl.value.trim() === '') {
        return `Informe a dose no item ${i + 1}.`;
      }
    }
    return null;
  });

  public canSubmit = computed(() => {
    this.formVersion();
    if (this.isSaving()) return false;
    if (!this.form.valid) return false;
    if (this.form.controls.name.value.trim().length === 0) return false;
    if (this.inputsArray.length === 0) return false;
    for (let i = 0; i < this.inputsArray.length; i++) {
      const g = this.inputsArray.at(i) as FormGroup;
      const inputId = g.get('input_id')?.value;
      const dose = g.get('dose')?.value;
      if (!inputId || !dose || dose.trim().length === 0) return false;
    }
    return true;
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.formVersion.update((value) => value + 1);
    });
    this.form.statusChanges.subscribe(() => {
      this.formVersion.update((value) => value + 1);
    });
  }

  public async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    try {
      await Promise.all([
        this.mixturesRepository.findAll(),
        this.inputsRepository.findAll(),
      ]);
    } catch {
      this.loadFailed.set(true);
      this.messageService.error('Erro ao carregar as caldas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public addInputItem(preselectedInputId?: string): void {
    let defaultDose = '';
    let defaultUnit = '';
    let inputName = '';

    if (preselectedInputId) {
      const found = this.availableInputs().find((i) => i.id === preselectedInputId);
      if (found) {
        defaultDose = found.label_dose ?? '';
        defaultUnit = found.dose_unit ?? '';
        inputName = found.name;
      }
    }

    const group = this.formBuilder.group({
      input_id: this.formBuilder.nonNullable.control(preselectedInputId ?? '', [Validators.required]),
      dose: this.formBuilder.nonNullable.control(defaultDose, [Validators.required]),
      dose_unit: this.formBuilder.control<string | null>(defaultUnit),
      input_name: this.formBuilder.control<string>(inputName),
    });

    this.inputsArray.push(group);
    this.formVersion.update((v) => v + 1);
  }

  public onInputChange(index: number, inputId: string): void {
    const group = this.inputsArray.at(index) as FormGroup;
    if (!group) return;

    const input = this.availableInputs().find((i) => i.id === inputId);
    if (input) {
      group.patchValue({
        input_id: input.id,
        dose: input.label_dose ?? '',
        dose_unit: input.dose_unit ?? '',
        input_name: input.name,
      });
    } else {
      group.patchValue({
        input_id: '',
        dose: '',
        dose_unit: '',
        input_name: '',
      });
    }
    this.formVersion.update((v) => v + 1);
  }

  public removeInputItem(index: number): void {
    this.inputsArray.removeAt(index);
    this.formVersion.update((v) => v + 1);
  }

  public openCreate(): void {
    this.editingMixture.set(null);
    this.resetForm();
    // Inicia com um slot de insumo vazio para conveniência
    this.addInputItem();
    this.dialogVisible.set(true);
  }

  public openEdit(mixture: MixtureItem): void {
    this.editingMixture.set(mixture);
    this.resetForm();

    this.form.patchValue({
      name: mixture.name,
      is_active: mixture.is_active,
      observations: mixture.observations ?? '',
    });

    if (mixture.inputs && mixture.inputs.length > 0) {
      for (const item of mixture.inputs) {
        const group = this.formBuilder.group({
          input_id: this.formBuilder.nonNullable.control(item.input_id, [Validators.required]),
          dose: this.formBuilder.nonNullable.control(item.dose ?? '', [Validators.required]),
          dose_unit: this.formBuilder.control<string | null>(item.dose_unit ?? item.input?.dose_unit ?? ''),
          input_name: this.formBuilder.control<string>(item.input?.name ?? ''),
        });
        this.inputsArray.push(group);
      }
    } else {
      this.addInputItem();
    }

    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formVersion.update((v) => v + 1);
    this.dialogVisible.set(true);
  }

  public openDetails(mixture: MixtureItem): void {
    this.selectedMixtureForDetails.set(mixture);
    this.detailsDialogVisible.set(true);
  }

  public closeDetails(): void {
    this.detailsDialogVisible.set(false);
    this.selectedMixtureForDetails.set(null);
  }

  public closeDialog(): void {
    this.dialogVisible.set(false);
    this.editingMixture.set(null);
    this.resetForm();
  }

  public async submit(): Promise<void> {
    if (!this.canSubmit()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const editing = this.editingMixture();
    this.loadingService.show(
      editing ? 'Atualizando calda...' : 'Cadastrando calda...',
    );

    const raw = this.form.getRawValue();
    const inputsDraft: MixtureInputDraft[] = (raw.inputs as MixtureInputFormGroup[]).map((i) => ({
      input_id: i.input_id,
      dose: i.dose.trim(),
      dose_unit: i.dose_unit?.trim() || null,
    }));

    const authorName = this.getAuthorName();
    const authorEmail = this.getAuthorEmail();

    const draft: MixtureDraft = {
      name: raw.name.trim(),
      registered_by_name: editing ? editing.registered_by_name : authorName,
      registered_by_email: editing ? editing.registered_by_email : authorEmail,
      is_active: raw.is_active,
      observations: raw.observations?.trim() || null,
      inputs: inputsDraft,
    };

    try {
      if (editing) {
        const { error } = await this.mixturesRepository.update(editing.id, draft);
        if (error) {
          this.handleSaveError(error);
          return;
        }
        this.messageService.success('Calda atualizada com sucesso!');
      } else {
        const { error } = await this.mixturesRepository.create(draft);
        if (error) {
          this.handleSaveError(error);
          return;
        }
        this.messageService.success('Calda cadastrada com sucesso!');
      }
      this.closeDialog();
    } catch {
      this.messageService.error('Erro inesperado ao salvar a calda.');
    } finally {
      this.isSaving.set(false);
      this.loadingService.hide();
    }
  }

  public async deleteSingle(mixture: MixtureItem): Promise<boolean> {
    this.loadingService.show('Excluindo calda...');
    try {
      const { error } = await this.mixturesRepository.deleteMany([mixture.id]);
      if (error) {
        this.messageService.error('Erro ao excluir a calda.');
        return false;
      }
      this.selectedMixtures.update((selected) =>
        selected.filter((item) => item.id !== mixture.id),
      );
      this.messageService.success('Calda excluída com sucesso!');
      return true;
    } catch {
      this.messageService.error('Erro inesperado ao excluir a calda.');
      return false;
    } finally {
      this.loadingService.hide();
    }
  }

  public async deleteSelected(): Promise<boolean> {
    const selected = this.selectedMixtures();
    if (selected.length === 0) return false;

    this.loadingService.show(`Excluindo ${selected.length} caldas...`);
    try {
      const ids = selected.map((item) => item.id);
      const { error } = await this.mixturesRepository.deleteMany(ids);
      if (error) {
        this.messageService.error('Erro ao excluir as caldas selecionadas.');
        return false;
      }
      this.selectedMixtures.set([]);
      this.messageService.success('Caldas excluídas com sucesso!');
      return true;
    } catch {
      this.messageService.error('Erro inesperado ao excluir as caldas.');
      return false;
    } finally {
      this.loadingService.hide();
    }
  }

  public getAuthorName(): string {
    const currentUser = this.usersRepository.currentUser();
    if (currentUser?.full_name?.trim()) {
      return currentUser.full_name.trim();
    }
    const authUser = this.authenticationRepository.user();
    const metaName = authUser?.user_metadata?.['full_name'] as string | undefined;
    if (metaName?.trim()) {
      return metaName.trim();
    }
    if (authUser?.email) {
      return authUser.email.split('@')[0];
    }
    return 'Operador';
  }

  public getAuthorEmail(): string {
    const currentUser = this.usersRepository.currentUser();
    if (currentUser?.email?.trim()) {
      return currentUser.email.trim();
    }
    const authUser = this.authenticationRepository.user();
    if (authUser?.email?.trim()) {
      return authUser.email.trim();
    }
    return 'operador@pomar.com';
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      is_active: true,
      observations: '',
    });
    this.inputsArray.clear();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formVersion.update((v) => v + 1);
  }

  private handleSaveError(error: { code?: string; message?: string }): void {
    if (error.code === '23505') {
      this.messageService.error('Já existe uma calda cadastrada com este nome.');
      return;
    }
    this.messageService.error(error.message || 'Erro ao salvar a calda.');
  }
}

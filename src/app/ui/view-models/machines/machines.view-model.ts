import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MachinesRepository } from '../../../data/repositories/machines/machines.repository';
import { MachineExcelService } from '../../../data/services/machine-excel/machine-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { MachineDraft, MachineItem } from '../../../domain/models/machine.model';
import { LoadingService } from '../../../shared/services/loading.service';

@Injectable({ providedIn: 'root' })
export class MachinesViewModel {
  private formBuilder = inject(FormBuilder);
  private machinesRepository = inject(MachinesRepository);
  private machineExcelService = inject(MachineExcelService);
  private messageService = inject(MessageService);
  private loadingService = inject(LoadingService);

  public machines = this.machinesRepository.machines;
  public isLoading = signal(false);
  public loadFailed = signal(false);
  public isSaving = signal(false);
  public dialogVisible = signal(false);
  public editingMachine = signal<MachineItem | null>(null);
  public selectedMachines = signal<MachineItem[]>([]);
  public formVersion = signal(0);

  public form = this.formBuilder.group({
    name: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(150),
    ]),
    brand: this.formBuilder.control<string | null>(null, [
      Validators.maxLength(100),
    ]),
    acquisition_date: this.formBuilder.control<string | null>(null),
    manufacturing_year: this.formBuilder.control<number | null>(null, [
      Validators.min(1900),
      Validators.max(2100),
    ]),
    quantity: this.formBuilder.nonNullable.control<number>(1, [
      Validators.required,
      Validators.min(1),
    ]),
    observations: this.formBuilder.control<string | null>(null, [
      Validators.maxLength(1000),
    ]),
  });

  public nameError = computed(() => {
    this.formVersion();
    const control = this.form.controls.name;
    if ((control.touched || control.dirty) && control.value.trim() === '') {
      return 'Informe o nome da máquina.';
    }
    if (control.hasError('maxlength')) {
      return 'O nome deve ter no máximo 150 caracteres.';
    }
    return null;
  });

  public quantityError = computed(() => {
    this.formVersion();
    const control = this.form.controls.quantity;
    if (control.hasError('min') || control.value < 1) {
      return 'A quantidade deve ser de no mínimo 1 unidade.';
    }
    return null;
  });

  public yearError = computed(() => {
    this.formVersion();
    const control = this.form.controls.manufacturing_year;
    if (control.hasError('min') || control.hasError('max')) {
      return 'Informe um ano de fabricação válido (1900 a 2100).';
    }
    return null;
  });

  public canSubmit = computed(() => {
    this.formVersion();
    return (
      !this.isSaving() &&
      this.form.valid &&
      this.form.controls.name.value.trim().length > 0 &&
      (this.form.controls.quantity.value ?? 1) >= 1
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
      const { error } = await this.machinesRepository.findAll();
      if (error) {
        this.loadFailed.set(true);
        this.messageService.error('Erro ao carregar as máquinas.');
      }
    } catch {
      this.loadFailed.set(true);
      this.messageService.error('Erro ao carregar as máquinas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreate(): void {
    this.editingMachine.set(null);
    this.resetForm({
      name: '',
      brand: null,
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
    });
    this.dialogVisible.set(true);
  }

  public openEdit(machine: MachineItem): void {
    this.editingMachine.set(machine);
    this.resetForm({
      name: machine.name,
      brand: machine.brand ?? null,
      acquisition_date: machine.acquisition_date ?? null,
      manufacturing_year: machine.manufacturing_year ?? null,
      quantity: machine.quantity ?? 1,
      observations: machine.observations ?? null,
    });
    this.dialogVisible.set(true);
  }

  public closeDialog(): void {
    if (this.isSaving()) return;
    this.dialogVisible.set(false);
    this.editingMachine.set(null);
    this.resetForm({
      name: '',
      brand: null,
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
    });
  }

  public async save(): Promise<void> {
    this.form.markAllAsTouched();
    this.formVersion.update((value) => value + 1);
    if (!this.canSubmit()) return;

    this.isSaving.set(true);
    this.loadingService.show();

    const raw = this.form.getRawValue();
    const payload: MachineDraft = {
      name: raw.name.trim(),
      brand: raw.brand && raw.brand.trim() !== '' ? raw.brand.trim() : null,
      acquisition_date: raw.acquisition_date ? String(raw.acquisition_date).trim() : null,
      manufacturing_year: raw.manufacturing_year ? Number(raw.manufacturing_year) : null,
      quantity: raw.quantity && raw.quantity >= 1 ? Number(raw.quantity) : 1,
      observations: raw.observations && raw.observations.trim() !== '' ? raw.observations.trim() : null,
    };

    try {
      const current = this.editingMachine();
      if (current) {
        const { error } = await this.machinesRepository.update(current.id, payload);
        if (error) {
          this.messageService.error('Não foi possível atualizar a máquina.');
        } else {
          this.messageService.success('Máquina atualizada com sucesso!');
          this.dialogVisible.set(false);
          this.editingMachine.set(null);
          this.resetForm({
            name: '',
            brand: null,
            acquisition_date: null,
            manufacturing_year: null,
            quantity: 1,
            observations: null,
          });
        }
      } else {
        const { error } = await this.machinesRepository.create(payload);
        if (error) {
          this.messageService.error('Não foi possível cadastrar a máquina.');
        } else {
          this.messageService.success('Máquina cadastrada com sucesso!');
          this.dialogVisible.set(false);
          this.editingMachine.set(null);
          this.resetForm({
            name: '',
            brand: null,
            acquisition_date: null,
            manufacturing_year: null,
            quantity: 1,
            observations: null,
          });
        }
      }
    } catch {
      this.messageService.error('Ocorreu um erro inesperado ao salvar.');
    } finally {
      this.isSaving.set(false);
      this.loadingService.hide();
    }
  }

  public async deleteSingle(machine: MachineItem): Promise<boolean> {
    this.loadingService.show();
    try {
      const { error } = await this.machinesRepository.deleteMany([machine.id]);
      if (error) {
        this.messageService.error('Não foi possível excluir a máquina.');
        return false;
      }
      this.selectedMachines.update((items) => items.filter((m) => m.id !== machine.id));
      this.messageService.success('Máquina excluída com sucesso!');
      return true;
    } catch {
      this.messageService.error('Erro inesperado ao excluir a máquina.');
      return false;
    } finally {
      this.loadingService.hide();
    }
  }

  public async deleteSelected(): Promise<boolean> {
    const targets = this.selectedMachines();
    if (targets.length === 0) return false;

    this.loadingService.show();
    try {
      const ids = targets.map((m) => m.id);
      const { error } = await this.machinesRepository.deleteMany(ids);
      if (error) {
        this.messageService.error('Não foi possível excluir as máquinas selecionadas.');
        return false;
      }
      this.selectedMachines.set([]);
      this.messageService.success(
        targets.length === 1
          ? '1 máquina excluída com sucesso!'
          : `${targets.length} máquinas excluídas com sucesso!`,
      );
      return true;
    } catch {
      this.messageService.error('Erro inesperado ao excluir máquinas selecionadas.');
      return false;
    } finally {
      this.loadingService.hide();
    }
  }

  public async exportExcel(): Promise<void> {
    const list = this.machines();
    if (list.length === 0) {
      this.messageService.error('Não há máquinas cadastradas para exportar.');
      return;
    }

    try {
      await this.machineExcelService.export(list);
      this.messageService.success('Planilha de máquinas gerada com sucesso!');
    } catch {
      this.messageService.error('Erro ao gerar a planilha Excel.');
    }
  }

  private resetForm(values: {
    name: string;
    brand: string | null;
    acquisition_date: string | null;
    manufacturing_year: number | null;
    quantity: number;
    observations: string | null;
  }): void {
    this.form.reset(values);
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.formVersion.update((value) => value + 1);
  }
}

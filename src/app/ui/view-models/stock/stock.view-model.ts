import { computed, inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { StockRepository } from '../../../data/repositories/stock/stock.repository';
import { MessageService } from '../../../data/services/message/message.service';
import { STOCK_PHOTO_MAX_SIZE_BYTES } from '../../../data/services/stock/stock.service';
import {
  STOCK_UNIT_OPTIONS,
  type StockDraft,
  type StockItem,
  type StockUnit,
  stockTypeBadgeStyle,
  stockTypeLabel,
} from '../../../domain/models/stock.model';
import { LoadingService } from '../../../shared/services/loading.service';

@Injectable({ providedIn: 'root' })
export class StockViewModel {
  private formBuilder = inject(FormBuilder);
  private stockRepository = inject(StockRepository);
  private messageService = inject(MessageService);
  private loadingService = inject(LoadingService);

  public stockItems = this.stockRepository.stockItems;
  public availableTypes = this.stockRepository.availableTypes;

  public isLoading = signal(false);
  public loadFailed = signal(false);
  public isSaving = signal(false);
  public isSavingType = signal(false);

  public dialogVisible = signal(false);
  public typeDialogVisible = signal(false);
  public detailsDialogVisible = signal(false);

  public editingStockItem = signal<StockItem | null>(null);
  public selectedStockItemForDetails = signal<StockItem | null>(null);
  public selectedStockItems = signal<StockItem[]>([]);
  public selectedPhotoFile = signal<File | null>(null);
  public photoPreviewUrl = signal<string | null>(null);
  public detailsPhotoUrl = signal<string | null>(null);
  public photoError = signal<string | null>(null);
  public isPhotoLoading = signal(false);

  public unitOptions = STOCK_UNIT_OPTIONS;

  public formVersion = signal(0);
  public typeFormVersion = signal(0);

  public typeLabel = stockTypeLabel;
  public typeBadgeStyle = stockTypeBadgeStyle;

  public typeOptions = computed(() => {
    return this.availableTypes().map((type) => ({
      label: stockTypeLabel(type),
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
    quantity: this.formBuilder.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
    unit: this.formBuilder.control<StockUnit | null>(null, [Validators.required]),
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
      return 'Informe o nome do item do estoque.';
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
      return 'Selecione o tipo do item do estoque.';
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
      !this.quantityError() &&
      !this.unitError() &&
      !this.photoError() &&
      this.form.controls.name.value.trim().length > 0 &&
      this.form.controls.type.value.trim().length > 0
    );
  });

  public quantityError = computed(() => {
    this.formVersion();
    const control = this.form.controls.quantity;
    if ((control.touched || control.dirty) && control.hasError('required')) {
      return 'Informe a quantidade.';
    }
    if (control.hasError('min')) {
      return 'A quantidade não pode ser negativa.';
    }
    return null;
  });

  public unitError = computed(() => {
    this.formVersion();
    const control = this.form.controls.unit;
    if ((control.touched || control.dirty) && control.hasError('required')) {
      return 'Selecione a unidade da quantidade.';
    }
    return null;
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
        this.stockRepository.findAll(),
        this.stockRepository.loadEnumValues(),
      ]);
    } catch {
      this.loadFailed.set(true);
      this.messageService.error('Erro ao carregar o estoque.');
    } finally {
      this.isLoading.set(false);
    }
  }

  public openCreate(): void {
    this.editingStockItem.set(null);
    this.resetForm();
    this.dialogVisible.set(true);
  }

  public openEdit(stockItem: StockItem): void {
    this.editingStockItem.set(stockItem);
    this.form.setValue({
      name: stockItem.name,
      type: stockItem.type,
      active_ingredient: stockItem.active_ingredient ?? '',
      formulation: stockItem.formulation ?? '',
      concentration: stockItem.concentration ?? '',
      chemical_group: stockItem.chemical_group ?? '',
      manufacturer: stockItem.manufacturer ?? '',
      mapa_registration: stockItem.mapa_registration ?? '',
      expiration_date: stockItem.expiration_date ?? '',
      registered_for_crop: stockItem.registered_for_crop ?? true,
      target_1: stockItem.target_1 ?? '',
      target_2: stockItem.target_2 ?? '',
      safety_interval_days: stockItem.safety_interval_days ?? null,
      label_dose: stockItem.label_dose ?? '',
      dose_unit: stockItem.dose_unit ?? '',
      quantity: stockItem.quantity,
      unit: stockItem.unit,
      observations: stockItem.observations ?? '',
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    void this.loadFormPhoto(stockItem.photo_object_path);
    this.dialogVisible.set(true);
  }

  public openDetails(stockItem: StockItem): void {
    this.selectedStockItemForDetails.set(stockItem);
    this.detailsPhotoUrl.set(null);
    void this.loadDetailsPhoto(stockItem.photo_object_path);
    this.detailsDialogVisible.set(true);
  }

  public closeDetails(): void {
    this.detailsDialogVisible.set(false);
    this.selectedStockItemForDetails.set(null);
    this.detailsPhotoUrl.set(null);
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
    this.editingStockItem.set(null);
    this.resetForm();
  }

  public selectPhoto(file: File | null): void {
    this.photoError.set(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.photoError.set('Selecione um arquivo de imagem válido.');
      return;
    }
    if (file.size > STOCK_PHOTO_MAX_SIZE_BYTES) {
      this.photoError.set('A imagem deve ter no máximo 5 MB.');
      return;
    }

    this.selectedPhotoFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.photoPreviewUrl.set(String(reader.result));
    reader.onerror = () => {
      this.selectedPhotoFile.set(null);
      this.photoError.set('Não foi possível carregar a pré-visualização.');
    };
    reader.readAsDataURL(file);
  }

  public clearSelectedPhoto(): void {
    this.selectedPhotoFile.set(null);
    this.photoError.set(null);
    const currentPath = this.editingStockItem()?.photo_object_path ?? null;
    void this.loadFormPhoto(currentPath);
  }

  public async submit(): Promise<void> {
    if (!this.canSubmit()) return;

    this.isSaving.set(true);
    this.loadingService.show(
      this.editingStockItem()
        ? 'Atualizando item do estoque...'
        : 'Cadastrando item no estoque...',
    );

    const raw = this.form.getRawValue();
    const draft: StockDraft = {
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
      quantity:
        raw.quantity !== null && raw.quantity !== undefined
          ? Number(raw.quantity)
          : null,
      unit: raw.unit,
      photo_object_path: this.editingStockItem()?.photo_object_path ?? null,
      observations: raw.observations?.trim() || null,
    };

    try {
      const editing = this.editingStockItem();
      if (editing) {
        const { error } = await this.stockRepository.update(
          editing.id,
          draft,
          this.selectedPhotoFile(),
          editing.photo_object_path,
        );
        if (error) {
          this.messageService.error('Erro ao atualizar item do estoque.');
          return;
        }
        this.messageService.success('Item do estoque atualizado com sucesso.');
      } else {
        const { error } = await this.stockRepository.create(
          draft,
          this.selectedPhotoFile(),
        );
        if (error) {
          this.messageService.error('Erro ao cadastrar item no estoque.');
          return;
        }
        this.messageService.success('Item cadastrado no estoque com sucesso.');
      }
      this.closeDialog();
    } catch {
      this.messageService.error('Erro ao salvar item do estoque.');
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
      const { error } = await this.stockRepository.addEnumValue(newTypeName);
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

  public async deleteStockItems(items: StockItem[]): Promise<void> {
    if (items.length === 0) return;

    this.isSaving.set(true);
    this.loadingService.show(
      items.length === 1
        ? 'Excluindo item do estoque...'
        : 'Excluindo itens do estoque...',
    );

    try {
      const ids = items.map((i) => i.id);
      const { error } = await this.stockRepository.deleteMany(ids);
      if (error) {
        this.messageService.error('Erro ao excluir item(ns) do estoque.');
        return;
      }
      this.selectedStockItems.update((selected) =>
        selected.filter((item) => !ids.includes(item.id)),
      );
      this.messageService.success('Item(ns) do estoque excluído(s) com sucesso.');
    } catch {
      this.messageService.error('Erro ao excluir item(ns) do estoque.');
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
      quantity: null,
      unit: null,
      observations: '',
    });
    this.selectedPhotoFile.set(null);
    this.photoPreviewUrl.set(null);
    this.photoError.set(null);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private async loadFormPhoto(objectPath: string | null): Promise<void> {
    this.selectedPhotoFile.set(null);
    this.photoPreviewUrl.set(null);
    if (!objectPath) return;
    this.isPhotoLoading.set(true);
    try {
      const { signedUrl } = await this.stockRepository.createSignedPhotoUrl(
        objectPath,
      );
      if (!this.selectedPhotoFile()) {
        this.photoPreviewUrl.set(signedUrl);
      }
    } finally {
      this.isPhotoLoading.set(false);
    }
  }

  private async loadDetailsPhoto(objectPath: string | null): Promise<void> {
    if (!objectPath) return;
    this.isPhotoLoading.set(true);
    try {
      const { signedUrl } = await this.stockRepository.createSignedPhotoUrl(
        objectPath,
      );
      this.detailsPhotoUrl.set(signedUrl);
    } finally {
      this.isPhotoLoading.set(false);
    }
  }
}

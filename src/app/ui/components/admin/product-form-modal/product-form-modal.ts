import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../../../domain/models/product.model';
import { Input as AppInput } from '../../../../shared/components/input/input';
import { Select as AppSelect } from '../../../../shared/components/select/select';

export interface ProductFormValue {
  name: string;
  active_ingredient: string | null;
  category: string | null;
  concentration: number | null;
  unit: string | null;
  manufacturer: string | null;
  notes: string | null;
  is_active: boolean | null;
}

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppInput, AppSelect],
  template: `
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
      (click)="onBackdropClick($event)"
      id="modal-backdrop"
    >
      <div 
        class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col max-h-[90vh]"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div>
            <h2 class="text-lg font-bold text-slate-800">
              {{ product ? 'Editar Produto' : 'Novo Produto' }}
            </h2>
            <p class="text-sm text-slate-500">Preencha os campos abaixo para salvar o produto.</p>
          </div>
          <button 
            (click)="close()"
            class="p-2 rounded-xl hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-600 transition-all"
          >
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar">
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-input
                label="Nome Comercial"
                placeholder="Ex: Roundup WG"
                formControlName="name"
                class="col-span-1 md:col-span-2"
              />

              <app-input
                label="Ingrediente Ativo"
                placeholder="Ex: Glifosato"
                formControlName="active_ingredient"
              />

              <app-select
                label="Categoria"
                formControlName="category"
                [options]="[
                  { value: 'Herbicida', label: 'Herbicida' },
                  { value: 'Inseticida', label: 'Inseticida' },
                  { value: 'Fungicida', label: 'Fungicida' },
                  { value: 'Adjuvante', label: 'Adjuvante' },
                  { value: 'Fertilizante', label: 'Fertilizante' }
                ]"
              />

              <div class="grid grid-cols-2 gap-4">
                <app-input
                  label="Concentração"
                  type="number"
                  placeholder="0.00"
                  formControlName="concentration"
                />
                <app-input
                  label="Unidade"
                  placeholder="ml/L"
                  formControlName="unit"
                />
              </div>

              <app-input
                label="Fabricante"
                placeholder="Ex: Bayer, Syngenta"
                formControlName="manufacturer"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Observações</label>
              <textarea
                formControlName="notes"
                rows="3"
                class="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm text-slate-700 resize-none"
                placeholder="Informações adicionais sobre o produto..."
              ></textarea>
            </div>

            <div class="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <input 
                type="checkbox" 
                id="is_active" 
                formControlName="is_active"
                class="w-5 h-5 rounded-lg border-emerald-200 text-emerald-600 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
              <label for="is_active" class="text-sm font-bold text-emerald-800 cursor-pointer select-none">
                Produto Ativo para Uso
              </label>
            </div>
          </form>
        </div>

        <!-- Modal Footer -->
        <div class="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 flex-shrink-0">
          <button 
            type="button"
            (click)="close()"
            class="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:bg-white hover:shadow-sm transition-all"
          >
            Cancelar
          </button>
          <button 
            type="button"
            (click)="onSubmit()"
            [disabled]="productForm.invalid || isSaving"
            class="px-8 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-sm transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            @if (isSaving) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Salvando...
            } @else {
              Salvar Alterações
            }
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductFormModal implements OnChanges {
  @Input() public product: Product | null = null;
  @Input() public isSaving = false;
  @Output() public closed = new EventEmitter<void>();
  @Output() public submitted = new EventEmitter<ProductFormValue>();

  private formBuilder = inject(FormBuilder);

  public productForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    active_ingredient: ['', [Validators.maxLength(150)]],
    category: ['', [Validators.maxLength(100)]],
    concentration: [''],
    unit: ['ml/L', [Validators.maxLength(40)]],
    manufacturer: ['', [Validators.maxLength(120)]],
    notes: ['', [Validators.maxLength(500)]],
    is_active: [true],
  });

  public ngOnChanges(changes: SimpleChanges): void {
    if ('product' in changes) {
      this.productForm.reset({
        name: this.product?.name ?? '',
        active_ingredient: this.product?.active_ingredient ?? '',
        category: this.product?.category ?? '',
        concentration: this.product?.concentration?.toString() ?? '',
        unit: this.product?.unit ?? 'ml/L',
        manufacturer: this.product?.manufacturer ?? '',
        notes: this.product?.notes ?? '',
        is_active: this.product?.is_active ?? true,
      });
    }
  }

  @HostListener('document:keydown.escape')
  public onEscapeKey(): void {
    this.close();
  }

  public close(): void {
    if (this.isSaving) return;
    this.closed.emit();
  }

  public onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).id === 'modal-backdrop') {
      this.close();
    }
  }

  public onSubmit(): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) return;

    const value = this.productForm.getRawValue();
    const normalizedConcentration = String(value.concentration).trim();

    this.submitted.emit({
      name: value.name.trim(),
      active_ingredient: this.normalizeOptionalText(value.active_ingredient),
      category: this.normalizeOptionalText(value.category),
      concentration: normalizedConcentration ? Number(normalizedConcentration) : null,
      unit: this.normalizeOptionalText(value.unit),
      manufacturer: this.normalizeOptionalText(value.manufacturer),
      notes: this.normalizeOptionalText(value.notes),
      is_active: value.is_active,
    });
  }

  private normalizeOptionalText(value: string | null): string | null {
    if (!value) return null;
    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : null;
  }
}

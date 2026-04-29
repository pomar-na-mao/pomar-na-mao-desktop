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
import { TranslateModule } from '@ngx-translate/core';
import type { Product } from '../../../../domain/models/product.model';
import { AppButton } from '../../../../shared/components';

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
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, AppButton],
  templateUrl: './product-form-modal.html',
  styleUrls: ['./product-form-modal.scss'],
})
export class ProductFormModalComponent implements OnChanges {
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
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  public onSubmit(): void {
    this.productForm.markAllAsTouched();

    if (this.productForm.invalid) return;

    const value = this.productForm.getRawValue();
    const normalizedConcentration = value.concentration.trim();

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

  private normalizeOptionalText(value: string): string | null {
    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : null;
  }
}

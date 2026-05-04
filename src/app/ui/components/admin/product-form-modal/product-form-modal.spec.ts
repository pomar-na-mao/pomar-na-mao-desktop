import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductFormModal } from './product-form-modal';
import { Product } from '../../../../domain/models/product.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimpleChange } from '@angular/core';

describe('ProductFormModal', () => {
  let component: ProductFormModal;
  let fixture: ComponentFixture<ProductFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFormModal, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormModal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize empty form when no product is provided', () => {
    expect(component.productForm.getRawValue().name).toBe('');
    expect(component.productForm.getRawValue().is_active).toBe(true);
  });

  it('should populate form when product is provided via ngOnChanges', () => {
    const product = { 
      id: '1', 
      name: 'Product A', 
      active_ingredient: 'Ingredient X',
      is_active: false
    } as Product;
    
    component.product = product;
    component.ngOnChanges({
      product: new SimpleChange(null, product, true)
    });

    expect(component.productForm.getRawValue().name).toBe('Product A');
    expect(component.productForm.getRawValue().active_ingredient).toBe('Ingredient X');
    expect(component.productForm.getRawValue().is_active).toBe(false);
  });

  it('should emit closed event when close() is called', () => {
    const spy = vi.spyOn(component.closed, 'emit');
    component.close();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit closed event if isSaving is true', () => {
    const spy = vi.spyOn(component.closed, 'emit');
    component.isSaving = true;
    component.close();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should validate required fields', () => {
    const nameControl = component.productForm.controls.name;
    nameControl.setValue('');
    expect(nameControl.valid).toBe(false);
    expect(nameControl.errors?.['required']).toBeTruthy();

    nameControl.setValue('Valid Name');
    expect(nameControl.valid).toBe(true);
  });

  it('should emit submitted event with normalized values when form is valid', () => {
    const spy = vi.spyOn(component.submitted, 'emit');
    
    component.productForm.patchValue({
      name: '  Trimmed Name  ',
      active_ingredient: '  Trimmed Ingredient  ',
      category: 'Herbicida',
      concentration: '10.5',
      unit: 'ml/L',
      is_active: true
    });

    component.onSubmit();

    expect(spy).toHaveBeenCalledWith({
      name: 'Trimmed Name',
      active_ingredient: 'Trimmed Ingredient',
      category: 'Herbicida',
      concentration: 10.5,
      unit: 'ml/L',
      manufacturer: null,
      notes: null,
      is_active: true
    });
  });

  it('should not emit submitted event if form is invalid', () => {
    const spy = vi.spyOn(component.submitted, 'emit');
    component.productForm.patchValue({ name: '' });
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call close when backdrop is clicked', () => {
    const spy = vi.spyOn(component, 'close');
    const event = { target: { id: 'modal-backdrop' } } as unknown as MouseEvent;
    component.onBackdropClick(event);
    expect(spy).toHaveBeenCalled();
  });

  it('should call close when escape key is pressed', () => {
    const spy = vi.spyOn(component, 'close');
    component.onEscapeKey();
    expect(spy).toHaveBeenCalled();
  });
});

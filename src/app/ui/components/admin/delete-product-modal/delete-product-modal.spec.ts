import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteProductModal } from './delete-product-modal';
import { Product } from '../../../../domain/models/product.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('DeleteProductModal', () => {
  let component: DeleteProductModal;
  let fixture: ComponentFixture<DeleteProductModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteProductModal],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteProductModal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display product name', () => {
    component.product = { id: '1', name: 'Product X' } as Product;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('"Product X"');
  });

  it('should emit confirmed event when confirm button is clicked', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.confirmed, 'emit');
    const confirmBtn = fixture.nativeElement.querySelector('button.bg-rose-600');
    confirmBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit closed event when cancel button is clicked', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.closed, 'emit');
    const cancelBtn = fixture.nativeElement.querySelector('button.text-slate-500');
    cancelBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit closed event if isDeleting is true', () => {
    const spy = vi.spyOn(component.closed, 'emit');
    component.isDeleting = true;
    component.close();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should call close when backdrop is clicked', () => {
    const spy = vi.spyOn(component, 'close');
    const event = { target: { id: 'delete-backdrop' } } as unknown as MouseEvent;
    component.onBackdropClick(event);
    expect(spy).toHaveBeenCalled();
  });

  it('should call close when escape key is pressed', () => {
    const spy = vi.spyOn(component, 'close');
    component.onEscapeKey();
    expect(spy).toHaveBeenCalled();
  });
});

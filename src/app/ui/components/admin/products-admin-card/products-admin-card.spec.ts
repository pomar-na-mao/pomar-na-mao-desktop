import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsAdminCard } from './products-admin-card';
import { Product } from '../../../../domain/models/product.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProductsAdminCard', () => {
  let component: ProductsAdminCard;
  let fixture: ComponentFixture<ProductsAdminCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsAdminCard],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsAdminCard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display loading state when isLoading is true', () => {
    component.isLoading = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.animate-spin')).toBeTruthy();
    expect(compiled.textContent).toContain('Carregando catálogo...');
  });

  it('should display empty state when products list is empty', () => {
    component.products = [];
    component.isLoading = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum produto encontrado');
  });

  it('should render table rows when products are provided', () => {
    component.products = [
      { id: '1', name: 'Product 1', category: 'C1', active_ingredient: 'A1', is_active: true } as Product,
      { id: '2', name: 'Product 2', category: 'C2', active_ingredient: 'A2', is_active: false } as Product,
    ];
    component.isLoading = false;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(compiled.textContent).toContain('Product 1');
    expect(compiled.textContent).toContain('Product 2');
  });

  it('should emit refreshed event when refresh button is clicked', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.refreshed, 'emit');
    const refreshBtn = fixture.nativeElement.querySelector('button[title="Atualizar lista"]');
    refreshBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit created event when new product button is clicked', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component.created, 'emit');
    const createBtn = fixture.nativeElement.querySelector('button.bg-emerald-600');
    createBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit edited event when edit button is clicked', () => {
    component.products = [{ id: '1', name: 'P1' } as Product];
    fixture.detectChanges();
    
    const spy = vi.spyOn(component.edited, 'emit');
    const editBtn = fixture.nativeElement.querySelector('button[title="Editar"]');
    editBtn.click();
    expect(spy).toHaveBeenCalledWith(component.products[0]);
  });

  it('should emit deleted event when delete button is clicked', () => {
    component.products = [{ id: '1', name: 'P1' } as Product];
    fixture.detectChanges();
    
    const spy = vi.spyOn(component.deleted, 'emit');
    const deleteBtn = fixture.nativeElement.querySelector('button[title="Excluir"]');
    deleteBtn.click();
    expect(spy).toHaveBeenCalledWith(component.products[0]);
  });
});

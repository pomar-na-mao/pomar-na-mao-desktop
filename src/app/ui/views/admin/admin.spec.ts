import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Admin } from './admin';
import { AdminViewModel } from '../../view-models/admin/admin.view-model';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('Admin', () => {
  let component: Admin;
  let fixture: ComponentFixture<Admin>;
  
  const mockAdminViewModel = {
    loadProducts: vi.fn(),
    products: signal([]),
    isLoading: signal(false),
    isSaving: signal(false),
    isDeleting: signal(false),
    isModalOpen: signal(false),
    editingProduct: signal(null),
    deletingProduct: signal(null),
    stats: signal({ total: 0, active: 0, inactive: 0 }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [
        { provide: AdminViewModel, useValue: mockAdminViewModel }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load products on init', () => {
    expect(mockAdminViewModel.loadProducts).toHaveBeenCalled();
  });

  it('should have admin modules defined', () => {
    expect(component.adminModules.length).toBeGreaterThan(0);
    expect(component.adminModules.find(m => m.id === 'products')?.active).toBe(true);
  });
});

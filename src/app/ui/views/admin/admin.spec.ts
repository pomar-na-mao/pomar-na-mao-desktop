import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Admin } from './admin';
import { AdminViewModel } from '../../view-models/admin/admin.view-model';
import { VarietiesViewModel } from '../../view-models/varieties/varieties.view-model';
import { RegionsViewModel } from '../../view-models/regions/regions.view-model';
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

  const mockVarietiesViewModel = {
    loadVarieties: vi.fn(),
    varieties: signal([]),
    isLoading: signal(false),
    isSaving: signal(false),
    isDeleting: signal(false),
    isModalOpen: signal(false),
    editingVariety: signal(null),
    deletingVariety: signal(null),
    stats: signal({ total: 0 }),
  };

  const mockRegionsViewModel = {
    loadRegions: vi.fn(),
    regions: signal([]),
    isLoading: signal(false),
    stats: signal({ total: 0, unique: 0 }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Admin],
      providers: [
        { provide: AdminViewModel, useValue: mockAdminViewModel },
        { provide: VarietiesViewModel, useValue: mockVarietiesViewModel },
        { provide: RegionsViewModel, useValue: mockRegionsViewModel }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Admin);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load products, varieties and regions on init', () => {
    fixture.detectChanges();
    expect(mockAdminViewModel.loadProducts).toHaveBeenCalled();
    expect(mockVarietiesViewModel.loadVarieties).toHaveBeenCalled();
    expect(mockRegionsViewModel.loadRegions).toHaveBeenCalled();
  });

  it('should have admin tabs defined', () => {
    expect(component.tabs.length).toBeGreaterThan(0);
    expect(component.tabs.find(t => t.id === 'products')).toBeDefined();
    expect(component.tabs.find(t => t.id === 'varieties')).toBeDefined();
    expect(component.tabs.find(t => t.id === 'regions')).toBeDefined();
  });

  it('should change active tab', () => {
    component.setActiveTab('varieties');
    expect(component.activeTab).toBe('varieties');
  });
});

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StockRepository } from '../../../data/repositories/stock/stock.repository';
import { StockExcelService } from '../../../data/services/stock-excel/stock-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { StockItem } from '../../../domain/models/stock.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { Stock } from './stock';

describe('Stock', () => {
  let fixture: ComponentFixture<Stock>;
  let component: Stock;

  const sampleInput: StockItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Sivanto Prime 200 SL',
    type: 'INSECTICIDE',
    active_ingredient: 'Flupiradifurona',
    formulation: 'SL',
    concentration: '200 g/L',
    chemical_group: 'Butenolida',
    manufacturer: 'Bayer CropScience',
    mapa_registration: '00123/20',
    expiration_date: '2027-12-31',
    registered_for_crop: true,
    target_1: 'Psilídeo (Diaphorina citri)',
    target_2: 'Pulgões',
    safety_interval_days: 7,
    label_dose: '50 - 100',
    dose_unit: 'mL/100L',
    quantity: 12.5,
    unit: 'L',
    photo_object_path: null,
    observations: 'Ação sistêmica.',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  };

  const stockItems = signal<StockItem[]>([sampleInput]);
  const availableTypes = signal<string[]>(['INSECTICIDE', 'FUNGICIDE']);

  const repository = {
    stockItems,
    availableTypes,
    findAll: vi.fn().mockResolvedValue({ error: null }),
    loadEnumValues: vi.fn().mockResolvedValue(undefined),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn().mockResolvedValue({ error: null }),
    addEnumValue: vi.fn().mockResolvedValue({ error: null }),
    createSignedPhotoUrl: vi
      .fn()
      .mockResolvedValue({ signedUrl: null, error: null }),
  };

  const messages = { success: vi.fn(), error: vi.fn() };
  const loading = { show: vi.fn(), hide: vi.fn() };
  const excel = { export: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    vi.clearAllMocks();
    stockItems.set([sampleInput]);
    repository.findAll.mockResolvedValue({ error: null });
    repository.loadEnumValues.mockResolvedValue(undefined);
    repository.deleteMany.mockResolvedValue({ error: null });

    await TestBed.configureTestingModule({
      imports: [Stock],
      providers: [
        { provide: StockRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
        { provide: StockExcelService, useValue: excel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Stock);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and loads stock on initialization', () => {
    expect(component).toBeTruthy();
    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.loadEnumValues).toHaveBeenCalled();
  });

  it('opens details dialog when openDetails is called', () => {
    component.viewModel.openDetails(sampleInput);
    expect(component.viewModel.detailsDialogVisible()).toBe(true);
    expect(component.viewModel.selectedStockItemForDetails()).toEqual(sampleInput);

    component.viewModel.closeDetails();
    expect(component.viewModel.detailsDialogVisible()).toBe(false);
  });

  it('requires name, type, quantity and unit while keeping other fields optional', () => {
    component.viewModel.openCreate();
    const form = component.viewModel.form;

    expect(form.valid).toBe(false);

    form.patchValue({
      name: 'Adubo líquido',
      type: 'FERTILIZER',
      quantity: 10.5,
      unit: 'L',
    });

    expect(form.valid).toBe(true);
    expect(component.viewModel.canSubmit()).toBe(true);

    form.controls.quantity.setValue(null);
    form.controls.quantity.markAsTouched();
    expect(component.viewModel.quantityError()).toBe('Informe a quantidade.');

    form.controls.quantity.setValue(10.5);
    form.controls.unit.setValue(null);
    form.controls.unit.markAsTouched();
    expect(component.viewModel.unitError()).toBe(
      'Selecione a unidade da quantidade.',
    );
  });

  it('opens create type dialog and adds new type', async () => {
    component.viewModel.openCreateType();
    expect(component.viewModel.typeDialogVisible()).toBe(true);

    component.viewModel.typeForm.controls.typeName.setValue('BIOESTIMULANTE');
    expect(component.viewModel.canSubmitType()).toBe(true);

    await component.viewModel.submitType();
    expect(repository.addEnumValue).toHaveBeenCalledWith('BIOESTIMULANTE');
    expect(messages.success).toHaveBeenCalled();
  });

  it('calls exportExcel when triggered', async () => {
    await component.exportExcel();
    expect(excel.export).toHaveBeenCalledWith([sampleInput]);
  });
});

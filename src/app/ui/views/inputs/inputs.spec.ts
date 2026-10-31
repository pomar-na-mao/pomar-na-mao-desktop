import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InputsRepository } from '../../../data/repositories/inputs/inputs.repository';
import { InputExcelService } from '../../../data/services/input-excel/input-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { InputItem } from '../../../domain/models/input.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { Inputs } from './inputs';

describe('Inputs', () => {
  let fixture: ComponentFixture<Inputs>;
  let component: Inputs;

  const sampleInput: InputItem = {
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
    observations: 'Ação sistêmica.',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  };

  const inputs = signal<InputItem[]>([sampleInput]);
  const availableTypes = signal<string[]>(['INSECTICIDE', 'FUNGICIDE']);

  const repository = {
    inputs,
    availableTypes,
    findAll: vi.fn().mockResolvedValue({ error: null }),
    loadEnumValues: vi.fn().mockResolvedValue(undefined),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn().mockResolvedValue({ error: null }),
    addEnumValue: vi.fn().mockResolvedValue({ error: null }),
  };

  const messages = { success: vi.fn(), error: vi.fn() };
  const loading = { show: vi.fn(), hide: vi.fn() };
  const excel = { export: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    vi.clearAllMocks();
    inputs.set([sampleInput]);
    repository.findAll.mockResolvedValue({ error: null });
    repository.loadEnumValues.mockResolvedValue(undefined);
    repository.deleteMany.mockResolvedValue({ error: null });

    await TestBed.configureTestingModule({
      imports: [Inputs],
      providers: [
        { provide: InputsRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
        { provide: InputExcelService, useValue: excel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Inputs);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and loads inputs on initialization', () => {
    expect(component).toBeTruthy();
    expect(repository.findAll).toHaveBeenCalled();
    expect(repository.loadEnumValues).toHaveBeenCalled();
  });

  it('opens details dialog when openDetails is called', () => {
    component.viewModel.openDetails(sampleInput);
    expect(component.viewModel.detailsDialogVisible()).toBe(true);
    expect(component.viewModel.selectedInputForDetails()).toEqual(sampleInput);

    component.viewModel.closeDetails();
    expect(component.viewModel.detailsDialogVisible()).toBe(false);
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

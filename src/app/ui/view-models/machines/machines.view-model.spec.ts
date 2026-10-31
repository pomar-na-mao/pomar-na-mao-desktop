import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MachinesRepository } from '../../../data/repositories/machines/machines.repository';
import { MachineExcelService } from '../../../data/services/machine-excel/machine-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { MachineItem } from '../../../domain/models/machine.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { MachinesViewModel } from './machines.view-model';

describe('MachinesViewModel', () => {
  let viewModel: MachinesViewModel;

  const mockMachines = signal<MachineItem[]>([]);
  const mockRepository = {
    machines: mockMachines,
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  const mockExcelService = {
    export: vi.fn(),
  };

  const mockMessageService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  const mockLoadingService = {
    show: vi.fn(),
    hide: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockMachines.set([]);
    mockRepository.findAll.mockResolvedValue({ error: null });

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        MachinesViewModel,
        { provide: MachinesRepository, useValue: mockRepository },
        { provide: MachineExcelService, useValue: mockExcelService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: LoadingService, useValue: mockLoadingService },
      ],
    });

    viewModel = TestBed.inject(MachinesViewModel);
  });

  it('should initialize and load machines data', async () => {
    await viewModel.loadInitialData();

    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.loadFailed()).toBe(false);
  });

  it('openCreate should reset form with default quantity 1 and show dialog', () => {
    viewModel.openCreate();

    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.editingMachine()).toBeNull();
    expect(viewModel.form.controls.name.value).toBe('');
    expect(viewModel.form.controls.quantity.value).toBe(1);
    expect(viewModel.form.controls.brand.value).toBeNull();
  });

  it('openEdit should populate form with machine data and show dialog', () => {
    const item: MachineItem = {
      id: 'm-1',
      name: 'Trator A950',
      brand: 'Valtra',
      acquisition_date: '2024-05-10',
      manufacturing_year: 2023,
      quantity: 3,
      observations: 'Operação intensa',
      created_at: '2026-10-29T10:00:00Z',
      updated_at: '2026-10-29T10:00:00Z',
    };

    viewModel.openEdit(item);

    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.editingMachine()).toBe(item);
    expect(viewModel.form.controls.name.value).toBe('Trator A950');
    expect(viewModel.form.controls.brand.value).toBe('Valtra');
    expect(viewModel.form.controls.quantity.value).toBe(3);
    expect(viewModel.form.controls.manufacturing_year.value).toBe(2023);
  });

  it('validates required name field only', () => {
    viewModel.openCreate();

    expect(viewModel.canSubmit()).toBe(false);
    viewModel.form.controls.name.markAsTouched();
    expect(viewModel.nameError()).toBe('Informe o nome da máquina.');

    viewModel.form.controls.name.setValue('Colhedora');
    expect(viewModel.nameError()).toBeNull();
    expect(viewModel.canSubmit()).toBe(true);
  });

  it('saves new machine with minimal required data', async () => {
    mockRepository.create.mockResolvedValue({
      data: { id: 'm-1', name: 'Roçadeira', quantity: 1 },
      error: null,
    });

    viewModel.openCreate();
    viewModel.form.controls.name.setValue('Roçadeira');

    await viewModel.save();

    expect(mockRepository.create).toHaveBeenCalledWith({
      name: 'Roçadeira',
      brand: null,
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
    });
    expect(mockMessageService.success).toHaveBeenCalledWith('Máquina cadastrada com sucesso!');
    expect(viewModel.dialogVisible()).toBe(false);
  });

  it('saves updated machine', async () => {
    const item: MachineItem = {
      id: 'm-1',
      name: 'Trator',
      brand: 'Valtra',
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
      created_at: '2026-10-29T10:00:00Z',
      updated_at: '2026-10-29T10:00:00Z',
    };

    mockRepository.update.mockResolvedValue({
      data: { ...item, name: 'Trator Turbinado' },
      error: null,
    });

    viewModel.openEdit(item);
    viewModel.form.controls.name.setValue('Trator Turbinado');

    await viewModel.save();

    expect(mockRepository.update).toHaveBeenCalledWith('m-1', expect.objectContaining({
      name: 'Trator Turbinado',
    }));
    expect(mockMessageService.success).toHaveBeenCalledWith('Máquina atualizada com sucesso!');
    expect(viewModel.dialogVisible()).toBe(false);
  });

  it('deleteSingle calls repository and shows success', async () => {
    const item: MachineItem = {
      id: 'm-1',
      name: 'Trator',
      brand: null,
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
      created_at: '2026-10-29T10:00:00Z',
      updated_at: '2026-10-29T10:00:00Z',
    };

    mockRepository.deleteMany.mockResolvedValue({ error: null });

    const result = await viewModel.deleteSingle(item);

    expect(result).toBe(true);
    expect(mockRepository.deleteMany).toHaveBeenCalledWith(['m-1']);
    expect(mockMessageService.success).toHaveBeenCalledWith('Máquina excluída com sucesso!');
  });

  it('deleteSelected deletes all selected machines', async () => {
    const items: MachineItem[] = [
      {
        id: 'm-1',
        name: 'Trator 1',
        brand: null,
        acquisition_date: null,
        manufacturing_year: null,
        quantity: 1,
        observations: null,
        created_at: '2026-10-29T10:00:00Z',
        updated_at: '2026-10-29T10:00:00Z',
      },
      {
        id: 'm-2',
        name: 'Trator 2',
        brand: null,
        acquisition_date: null,
        manufacturing_year: null,
        quantity: 1,
        observations: null,
        created_at: '2026-10-29T10:00:00Z',
        updated_at: '2026-10-29T10:00:00Z',
      },
    ];

    viewModel.selectedMachines.set(items);
    mockRepository.deleteMany.mockResolvedValue({ error: null });

    const result = await viewModel.deleteSelected();

    expect(result).toBe(true);
    expect(mockRepository.deleteMany).toHaveBeenCalledWith(['m-1', 'm-2']);
    expect(viewModel.selectedMachines()).toEqual([]);
  });

  it('exportExcel exports when machines are present', async () => {
    mockMachines.set([
      {
        id: 'm-1',
        name: 'Trator',
        brand: null,
        acquisition_date: null,
        manufacturing_year: null,
        quantity: 1,
        observations: null,
        created_at: '2026-10-29T10:00:00Z',
        updated_at: '2026-10-29T10:00:00Z',
      },
    ]);

    await viewModel.exportExcel();

    expect(mockExcelService.export).toHaveBeenCalled();
    expect(mockMessageService.success).toHaveBeenCalledWith('Planilha de máquinas gerada com sucesso!');
  });
});

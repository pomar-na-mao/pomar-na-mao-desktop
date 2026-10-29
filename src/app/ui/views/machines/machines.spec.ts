import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MachinesRepository } from '../../../data/repositories/machines/machines.repository';
import { MachineExcelService } from '../../../data/services/machine-excel/machine-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { MachineItem } from '../../../domain/models/machine.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { Machines } from './machines';

describe('Machines', () => {
  let fixture: ComponentFixture<Machines>;
  let component: Machines;

  const item: MachineItem = {
    id: 'm-1',
    name: 'Trator Valtra A950',
    brand: 'Valtra',
    acquisition_date: '2024-05-10',
    manufacturing_year: 2023,
    quantity: 2,
    observations: 'Revisão a cada 250h',
    created_at: '2026-10-29T10:00:00Z',
    updated_at: '2026-10-29T10:00:00Z',
  };

  const machines = signal<MachineItem[]>([item]);
  const repository = {
    machines,
    findAll: vi.fn().mockResolvedValue({ error: null }),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn().mockResolvedValue({ error: null }),
  };

  const messages = { success: vi.fn(), error: vi.fn() };
  const loading = { show: vi.fn(), hide: vi.fn() };
  const excel = { export: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    vi.clearAllMocks();
    machines.set([item]);
    repository.findAll.mockResolvedValue({ error: null });
    repository.deleteMany.mockResolvedValue({ error: null });

    await TestBed.configureTestingModule({
      imports: [Machines],
      providers: [
        { provide: MachinesRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
        { provide: MachineExcelService, useValue: excel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Machines);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and loads machines on initialization', () => {
    expect(component).toBeTruthy();
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('renders table columns, machine data and accessible actions', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Trator Valtra A950');
    expect(root.textContent).toContain('Valtra');
    expect(root.textContent).toContain('2023');
    expect(root.textContent).toContain('2');
    expect(root.querySelector('input[aria-label="Buscar máquinas"]')).toBeTruthy();
    expect(root.querySelector('button[aria-label="Editar máquina"]')).toBeTruthy();
    expect(root.querySelector('button[aria-label="Excluir máquina"]')).toBeTruthy();
  });

  it('delegates global filter to PrimeNG table', () => {
    const tableSpy = vi.spyOn(component.table!, 'filterGlobal');
    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;

    input.value = 'Valtra';
    input.dispatchEvent(new Event('input'));

    expect(tableSpy).toHaveBeenCalledWith('Valtra', 'contains');
  });

  it('opens create and edit dialog state with expected form values', () => {
    expect(component.viewModel.dialogVisible()).toBe(false);

    component.viewModel.openCreate();
    expect(component.viewModel.dialogVisible()).toBe(true);
    expect(component.viewModel.editingMachine()).toBeNull();
    expect(component.viewModel.form.controls.name.value).toBe('');
    expect(component.viewModel.form.controls.quantity.value).toBe(1);

    component.viewModel.openEdit(item);
    expect(component.viewModel.editingMachine()).toBe(item);
    expect(component.viewModel.form.controls.name.value).toBe('Trator Valtra A950');
    expect(component.viewModel.form.controls.quantity.value).toBe(2);
  });

  it('prompts confirmation when deleting a machine', () => {
    const confirmSpy = vi.spyOn(component.confirmationService, 'confirm');

    component.confirmDelete(item);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Excluir máquina',
        message: 'Deseja realmente excluir a máquina “Trator Valtra A950”?',
      }),
    );
  });

  it('prompts confirmation when deleting selected machines', () => {
    const confirmSpy = vi.spyOn(component.confirmationService, 'confirm');
    component.viewModel.selectedMachines.set([item]);

    component.confirmDeleteSelected();

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Excluir máquinas selecionadas',
      }),
    );
  });

  it('triggers excel export on button click', () => {
    const exportSpy = vi.spyOn(component.viewModel, 'exportExcel');
    component.exportExcel();
    expect(exportSpy).toHaveBeenCalled();
  });
});

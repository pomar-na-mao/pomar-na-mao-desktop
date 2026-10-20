import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table } from 'primeng/table';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VarietiesRepository } from '../../../data/repositories/varieties/varieties-repository';
import { VarietyExcelService } from '../../../data/services/variety-excel/variety-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { Variety } from '../../../domain/models/variety.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { Varieties } from './varieties';

describe('Varieties', () => {
  let fixture: ComponentFixture<Varieties>;
  let component: Varieties;
  const item: Variety = {
    id: 1,
    name: 'Hass',
    description: 'Abacate Hass',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  };
  const varieties = signal<Variety[]>([item]);
  const repository = {
    varieties,
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
    varieties.set([item]);
    repository.findAll.mockResolvedValue({ error: null });
    repository.deleteMany.mockResolvedValue({ error: null });

    await TestBed.configureTestingModule({
      imports: [Varieties],
      providers: [
        { provide: VarietiesRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
        { provide: VarietyExcelService, useValue: excel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Varieties);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and loads varieties on initialization', () => {
    expect(component).toBeTruthy();
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('renders the table fields and accessible row actions', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).toContain('Hass');
    expect(root.textContent).toContain('Abacate Hass');
    expect(root.textContent).toContain('Criado em');
    expect(root.textContent).toContain('Atualizado em');
    expect(root.querySelector('input[aria-label="Buscar variedades"]')).toBeTruthy();
    expect(root.querySelector('button[aria-label="Editar variedade"]')).toBeTruthy();
    expect(root.querySelector('button[aria-label="Excluir variedade"]')).toBeTruthy();
  });

  it('renders empty and failed-load states without stale rows', () => {
    varieties.set([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nenhuma variedade encontrada.',
    );

    varieties.set([item]);
    component.viewModel.loadFailed.set(true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Não foi possível carregar as variedades.',
    );
    expect(root.textContent).not.toContain('Abacate Hass');
  });

  it('delegates global filtering by name and description', () => {
    const filterGlobal = vi.fn();
    component.table = { filterGlobal } as unknown as Table;

    component.onGlobalFilter({
      target: { value: 'hass' },
    } as unknown as Event);

    expect(filterGlobal).toHaveBeenCalledWith('hass', 'contains');
  });

  it('opens create and edit dialog state with the expected form values', () => {
    component.viewModel.openCreate();
    expect(component.viewModel.dialogVisible()).toBe(true);
    expect(component.viewModel.form.controls.name.value).toBe('');

    component.viewModel.openEdit(item);
    expect(component.viewModel.editingVariety()).toBe(item);
    expect(component.viewModel.form.controls.name.value).toBe('Hass');
  });

  it('requires explicit confirmation for row and batch deletion', async () => {
    const confirm = vi
      .spyOn(component.confirmationService, 'confirm')
      .mockImplementation(() => component.confirmationService);

    component.confirmDelete(item);
    const rowConfirmation = confirm.mock.calls[0][0];
    expect(rowConfirmation.message).toContain('Hass');
    expect(rowConfirmation.rejectButtonProps).toEqual({ outlined: true });
    expect(rowConfirmation.rejectButtonProps).not.toHaveProperty('severity');
    expect(rowConfirmation.acceptButtonProps).toEqual({
      severity: 'danger',
      outlined: true,
    });
    await rowConfirmation.accept?.();
    expect(repository.deleteMany).toHaveBeenCalledWith([1]);

    component.viewModel.selectedVarieties.set([item]);
    component.confirmDeleteSelected();
    const batchConfirmation = confirm.mock.calls[1][0];
    expect(batchConfirmation.message).toContain('1 variedade(s)');
    expect(batchConfirmation.rejectButtonProps).toEqual({ outlined: true });
    expect(batchConfirmation.rejectButtonProps).not.toHaveProperty('severity');
    expect(batchConfirmation.acceptButtonProps).toEqual({
      severity: 'danger',
      outlined: true,
    });
  });

  it('exports the filtered collection instead of only the current page', async () => {
    const filtered = [{ ...item, id: 2, name: 'Breda' }];
    component.table = { filteredValue: filtered } as unknown as Table;

    await component.exportExcel();

    expect(excel.export).toHaveBeenCalledWith(filtered);
  });

  it('exports the full loaded collection when there is no filter', async () => {
    component.table = { filteredValue: null } as unknown as Table;

    await component.exportExcel();

    expect(excel.export).toHaveBeenCalledWith([item]);
  });
});

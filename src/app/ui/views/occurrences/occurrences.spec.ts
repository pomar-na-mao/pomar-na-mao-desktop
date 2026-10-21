import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Table } from 'primeng/table';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OccurrenceTypesRepository } from '../../../data/repositories/occurrence-types/occurrence-types.repository';
import { OccurrenceTypeExcelService } from '../../../data/services/occurrence-type-excel/occurrence-type-excel.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { OccurrenceType } from '../../../domain/models/occurrence-type.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { Occurrences } from './occurrences';

describe('Occurrences', () => {
  let fixture: ComponentFixture<Occurrences>;
  let component: Occurrences;
  const item: OccurrenceType = {
    id: '47c97f71-8e3f-466f-b62c-737d1982f621',
    name: 'Ácaros',
    code: 'mites',
    category: 'PEST_DISEASE',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z',
  };
  const occurrenceTypes = signal<OccurrenceType[]>([item]);
  const repository = {
    occurrenceTypes,
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
    occurrenceTypes.set([item]);
    repository.findAll.mockResolvedValue({ error: null });
    repository.deleteMany.mockResolvedValue({ error: null });
    excel.export.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [Occurrences],
      providers: [
        { provide: OccurrenceTypesRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
        { provide: OccurrenceTypeExcelService, useValue: excel },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Occurrences);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and loads occurrence types on initialization', () => {
    expect(component).toBeTruthy();
    expect(repository.findAll).toHaveBeenCalled();
  });

  it('renders management columns without technical ID or code and exposes accessible actions', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.textContent).not.toContain(item.id);
    expect(root.textContent).toContain('Ácaros');
    expect(root.textContent).not.toContain('mites');
    expect(root.textContent).toContain('Praga ou doença');
    expect(root.textContent).toContain('Categoria');
    expect(root.textContent).toContain('Criado em');
    expect(root.textContent).toContain('Atualizado em');
    expect(
      root.querySelector('input[aria-label="Buscar ocorrências"]'),
    ).toBeTruthy();
    expect(
      root.querySelector('button[aria-label="Editar ocorrência"]'),
    ).toBeTruthy();
    expect(
      root.querySelector('button[aria-label="Excluir ocorrência"]'),
    ).toBeTruthy();
    expect(
      root
        .querySelector('button[aria-label="Editar ocorrência"]')
        ?.closest('.justify-center'),
    ).toBeTruthy();
    const category = root.querySelector('.occurrence-category');
    expect(category?.getAttribute('data-category')).toBe('PEST_DISEASE');
  });

  it('renders empty and failed-load states without stale rows', () => {
    occurrenceTypes.set([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nenhuma ocorrência encontrada.',
    );

    occurrenceTypes.set([item]);
    component.viewModel.loadFailed.set(true);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      'Não foi possível carregar as ocorrências.',
    );
    expect(root.textContent).not.toContain(item.id);
  });

  it('delegates global filtering by name', () => {
    const filterGlobal = vi.fn();
    component.table = { filterGlobal } as unknown as Table;

    component.onGlobalFilter({
      target: { value: 'Ácaros' },
    } as unknown as Event);

    expect(filterGlobal).toHaveBeenCalledWith('Ácaros', 'contains');
  });

  it('opens create and edit dialog state with the expected form values', () => {
    component.viewModel.openCreate();
    expect(component.viewModel.form.getRawValue()).toEqual({
      name: '',
      category: null,
    });

    component.viewModel.openEdit(item);
    expect(component.viewModel.editingOccurrenceType()).toBe(item);
    expect(component.viewModel.form.getRawValue()).toEqual({
      name: 'Ácaros',
      category: 'PEST_DISEASE',
    });
    fixture.detectChanges();
    expect(
      document.body.querySelector('[formcontrolname="category"]'),
    ).toBeTruthy();
    expect(document.body.querySelector('[formcontrolname="code"]')).toBeNull();
  });

  it('uses the project button convention for row and batch confirmations', async () => {
    const confirm = vi
      .spyOn(component.confirmationService, 'confirm')
      .mockImplementation(() => component.confirmationService);

    component.confirmDelete(item);
    const rowConfirmation = confirm.mock.calls[0][0];
    expect(rowConfirmation.message).toContain('Ácaros');
    expect(rowConfirmation.rejectButtonProps).toEqual({ outlined: true });
    expect(rowConfirmation.rejectButtonProps).not.toHaveProperty('severity');
    expect(rowConfirmation.acceptButtonProps).toEqual({
      severity: 'danger',
      outlined: true,
    });
    await rowConfirmation.accept?.();
    expect(repository.deleteMany).toHaveBeenCalledWith([item.id]);

    component.viewModel.selectedOccurrenceTypes.set([item]);
    component.confirmDeleteSelected();
    const batchConfirmation = confirm.mock.calls[1][0];
    expect(batchConfirmation.message).toContain('1 ocorrência(s)');
    expect(batchConfirmation.rejectButtonProps).toEqual({ outlined: true });
    expect(batchConfirmation.rejectButtonProps).not.toHaveProperty('severity');
    expect(batchConfirmation.acceptButtonProps).toEqual({
      severity: 'danger',
      outlined: true,
    });
  });

  it('exports filtered records or the full collection', async () => {
    const filtered = [{ ...item, id: 'id-2', name: 'Broca' }];
    component.table = { filteredValue: filtered } as unknown as Table;
    await component.exportExcel();
    expect(excel.export).toHaveBeenCalledWith(filtered);

    component.table = { filteredValue: null } as unknown as Table;
    await component.exportExcel();
    expect(excel.export).toHaveBeenLastCalledWith([item]);
  });

  it('shows an error toast when Excel generation fails', async () => {
    excel.export.mockRejectedValueOnce(new Error('failed'));

    await component.exportExcel();

    expect(messages.error).toHaveBeenCalledWith(
      'Erro ao gerar o arquivo Excel.',
    );
  });
});

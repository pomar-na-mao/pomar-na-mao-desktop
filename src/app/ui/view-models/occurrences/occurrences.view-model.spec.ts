import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OccurrenceTypesRepository } from '../../../data/repositories/occurrence-types/occurrence-types.repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { OccurrenceType } from '../../../domain/models/occurrence-type.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { OccurrencesViewModel } from './occurrences.view-model';

function occurrenceType(id = 'id-1', name = 'Ácaros'): OccurrenceType {
  return {
    id,
    name,
    code: 'mites',
    category: 'PEST_DISEASE',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  };
}

describe('OccurrencesViewModel', () => {
  let viewModel: OccurrencesViewModel;
  const occurrenceTypes = signal<OccurrenceType[]>([]);
  const repository = {
    occurrenceTypes,
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };
  const messages = { success: vi.fn(), error: vi.fn() };
  const loading = { show: vi.fn(), hide: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    occurrenceTypes.set([]);
    repository.findAll.mockResolvedValue({ error: null });
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        OccurrencesViewModel,
        { provide: OccurrenceTypesRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
      ],
    });
    viewModel = TestBed.inject(OccurrencesViewModel);
  });

  it('loads data and reports initial load errors', async () => {
    await viewModel.loadInitialData();
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.loadFailed()).toBe(false);

    repository.findAll.mockResolvedValueOnce({ error: { message: 'failed' } });
    await viewModel.loadInitialData();

    expect(viewModel.loadFailed()).toBe(true);
    expect(messages.error).toHaveBeenCalledWith(
      'Erro ao carregar as ocorrências.',
    );
  });

  it('opens clean create and populated edit forms', () => {
    viewModel.openCreate();
    expect(viewModel.form.getRawValue()).toEqual({
      name: '',
      category: null,
    });

    const item = occurrenceType();
    viewModel.openEdit(item);
    expect(viewModel.editingOccurrenceType()).toBe(item);
    expect(viewModel.form.getRawValue()).toEqual({
      name: 'Ácaros',
      category: 'PEST_DISEASE',
    });
  });

  it('blocks blank names after trimming and requires a category', async () => {
    viewModel.openCreate();
    viewModel.form.setValue({ name: '   ', category: null });

    await viewModel.save();

    expect(viewModel.nameError()).toBe('Informe o nome da ocorrência.');
    expect(viewModel.categoryError()).toBe(
      'Selecione a categoria da ocorrência.',
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('requires a category when editing a legacy uncategorized record', async () => {
    viewModel.openEdit({ ...occurrenceType(), category: null });

    await viewModel.save();

    expect(viewModel.categoryError()).toBe(
      'Selecione a categoria da ocorrência.',
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('normalizes the name, generates the code and completes creation', async () => {
    const created = occurrenceType('id-2', 'Broca');
    repository.create.mockResolvedValue({ data: created, error: null });
    viewModel.openCreate();
    viewModel.form.setValue({
      name: '  Galho   Quebrado ',
      category: 'PEST_DISEASE',
    });

    await viewModel.save();

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Galho   Quebrado',
      code: 'galho_quebrado',
      category: 'PEST_DISEASE',
    });
    expect(loading.show).toHaveBeenCalledWith('Adicionando ocorrência...');
    expect(loading.hide).toHaveBeenCalled();
    expect(messages.success).toHaveBeenCalledWith(
      'Ocorrência adicionada com sucesso.',
    );
    expect(viewModel.dialogVisible()).toBe(false);
  });

  it('preserves the draft and reports duplicate codes', async () => {
    repository.create.mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'duplicate' },
    });
    viewModel.openCreate();
    viewModel.form.setValue({
      name: 'Ácaros',
      category: 'PEST_DISEASE',
    });

    await viewModel.save();

    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.form.controls.name.value).toBe('Ácaros');
    expect(messages.error).toHaveBeenCalledWith(
      'Já existe uma ocorrência com este código.',
    );
    expect(loading.hide).toHaveBeenCalled();
  });

  it('keeps edit dialog data and unblocks the UI on failure', async () => {
    repository.update.mockRejectedValue(new Error('network'));
    viewModel.openEdit(occurrenceType());
    viewModel.form.controls.name.setValue('Ácaros severos');

    await viewModel.save();

    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.form.controls.name.value).toBe('Ácaros severos');
    expect(messages.error).toHaveBeenCalledWith('Erro ao editar a ocorrência.');
    expect(viewModel.isSaving()).toBe(false);
  });

  it('prevents duplicate submissions while a mutation is pending', async () => {
    let resolveCreate!: (value: unknown) => void;
    repository.create.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = resolve;
      }),
    );
    viewModel.openCreate();
    viewModel.form.setValue({
      name: 'Broca',
      category: 'STRUCTURAL',
    });

    const firstSave = viewModel.save();
    await viewModel.save();

    expect(repository.create).toHaveBeenCalledTimes(1);
    resolveCreate({ data: occurrenceType('id-2', 'Broca'), error: null });
    await firstSave;
  });

  it('preserves the existing code when editing the name', async () => {
    const item = occurrenceType();
    repository.update.mockResolvedValue({
      data: { ...item, name: 'Ácaros severos' },
      error: null,
    });
    viewModel.openEdit(item);
    viewModel.form.controls.name.setValue('Ácaros severos');

    await viewModel.save();

    expect(repository.update).toHaveBeenCalledWith(item.id, {
      name: 'Ácaros severos',
      code: 'mites',
      category: 'PEST_DISEASE',
    });
  });

  it('deletes selected rows and preserves selection on failure', async () => {
    const first = occurrenceType('1', 'A');
    const second = occurrenceType('2', 'B');
    viewModel.selectedOccurrenceTypes.set([first, second]);
    repository.deleteMany.mockResolvedValueOnce({
      error: { message: 'referenced' },
    });

    await viewModel.deleteOccurrenceTypes([first, second]);
    expect(viewModel.selectedOccurrenceTypes()).toEqual([first, second]);
    expect(messages.error).toHaveBeenCalledWith(
      'Não foi possível excluir as ocorrências. Uma delas pode estar em uso.',
    );

    repository.deleteMany.mockResolvedValueOnce({ error: null });
    await viewModel.deleteOccurrenceTypes([first]);
    expect(viewModel.selectedOccurrenceTypes()).toEqual([second]);
    expect(messages.success).toHaveBeenCalledWith(
      'Ocorrência excluída com sucesso.',
    );
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VarietiesRepository } from '../../../data/repositories/varieties/varieties-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { Variety } from '../../../domain/models/variety.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { VarietiesViewModel } from './varieties.view-model';

function variety(id = 1, name = 'Hass'): Variety {
  return {
    id,
    name,
    description: 'Descrição',
    created_at: '2026-10-20T10:00:00Z',
    updated_at: '2026-10-20T10:00:00Z',
  };
}

describe('VarietiesViewModel', () => {
  let viewModel: VarietiesViewModel;
  const varieties = signal<Variety[]>([]);
  const repository = {
    varieties,
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };
  const messages = {
    success: vi.fn(),
    error: vi.fn(),
  };
  const loading = {
    show: vi.fn(),
    hide: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    varieties.set([]);
    repository.findAll.mockResolvedValue({ error: null });
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        VarietiesViewModel,
        { provide: VarietiesRepository, useValue: repository },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
      ],
    });
    viewModel = TestBed.inject(VarietiesViewModel);
  });

  it('loads data and reports initial load errors', async () => {
    await viewModel.loadInitialData();
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.loadFailed()).toBe(false);

    repository.findAll.mockResolvedValueOnce({ error: { message: 'failed' } });
    await viewModel.loadInitialData();

    expect(viewModel.loadFailed()).toBe(true);
    expect(messages.error).toHaveBeenCalledWith('Erro ao carregar as variedades.');
  });

  it('opens clean create and populated edit forms', () => {
    viewModel.openCreate();
    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.form.getRawValue()).toEqual({ name: '', description: '' });

    const item = variety();
    viewModel.openEdit(item);
    expect(viewModel.editingVariety()).toBe(item);
    expect(viewModel.form.getRawValue()).toEqual({
      name: 'Hass',
      description: 'Descrição',
    });
  });

  it('blocks blank names after trimming', async () => {
    viewModel.openCreate();
    viewModel.form.controls.name.setValue('   ');

    await viewModel.save();

    expect(viewModel.nameError()).toBe('Informe o nome da variedade.');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('normalizes fields and completes creation with loading and toast', async () => {
    const created = variety(2, 'Breda');
    repository.create.mockResolvedValue({ data: created, error: null });
    viewModel.openCreate();
    viewModel.form.setValue({ name: '  Breda ', description: '   ' });

    await viewModel.save();

    expect(repository.create).toHaveBeenCalledWith({
      name: 'Breda',
      description: null,
    });
    expect(loading.show).toHaveBeenCalledWith('Adicionando variedade...');
    expect(loading.hide).toHaveBeenCalled();
    expect(messages.success).toHaveBeenCalledWith(
      'Variedade adicionada com sucesso.',
    );
    expect(viewModel.dialogVisible()).toBe(false);
    expect(viewModel.isSaving()).toBe(false);
  });

  it('keeps edit dialog data and unblocks the UI on failure', async () => {
    repository.update.mockRejectedValue(new Error('network'));
    const item = variety();
    viewModel.openEdit(item);
    viewModel.form.controls.name.setValue('Hass editada');

    await viewModel.save();

    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.form.controls.name.value).toBe('Hass editada');
    expect(messages.error).toHaveBeenCalledWith('Erro ao editar a variedade.');
    expect(loading.hide).toHaveBeenCalled();
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
    viewModel.form.setValue({ name: 'Breda', description: '' });

    const firstSave = viewModel.save();
    await viewModel.save();

    expect(repository.create).toHaveBeenCalledTimes(1);
    resolveCreate({ data: variety(2, 'Breda'), error: null });
    await firstSave;
  });

  it('deletes selected rows and preserves selection on failure', async () => {
    const first = variety(1, 'A');
    const second = variety(2, 'B');
    viewModel.selectedVarieties.set([first, second]);
    repository.deleteMany.mockResolvedValueOnce({ error: { message: 'failed' } });

    await viewModel.deleteVarieties([first, second]);
    expect(viewModel.selectedVarieties()).toEqual([first, second]);
    expect(messages.error).toHaveBeenCalledWith('Erro ao excluir as variedades.');

    repository.deleteMany.mockResolvedValueOnce({ error: null });
    await viewModel.deleteVarieties([first]);
    expect(viewModel.selectedVarieties()).toEqual([second]);
    expect(messages.success).toHaveBeenCalledWith(
      'Variedade excluída com sucesso.',
    );
  });
});

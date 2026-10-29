import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { InputsRepository } from '../../../data/repositories/inputs/inputs.repository';
import { MixturesRepository } from '../../../data/repositories/mixtures/mixtures.repository';
import { UsersRepository } from '../../../data/repositories/users/users-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { InputItem } from '../../../domain/models/input.model';
import type { MixtureItem } from '../../../domain/models/mixture.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { MixturesViewModel } from './mixtures.view-model';

describe('MixturesViewModel', () => {
  let viewModel: MixturesViewModel;

  const mockMixtures = signal<MixtureItem[]>([]);
  const mockInputs = signal<InputItem[]>([
    {
      id: 'input-1',
      name: 'Inseticida Alpha',
      type: 'INSECTICIDE',
      active_ingredient: 'Cipermetrina',
      formulation: 'EC',
      concentration: '250 g/L',
      chemical_group: 'Piretroide',
      manufacturer: 'AgroChem',
      mapa_registration: '12345',
      expiration_date: '2028-12-31',
      registered_for_crop: true,
      target_1: 'Lagarta',
      target_2: null,
      safety_interval_days: 7,
      label_dose: '150',
      dose_unit: 'ml/100L',
      observations: null,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
    {
      id: 'input-2',
      name: 'Fungicida Beta',
      type: 'FUNGICIDE',
      active_ingredient: 'Cobre',
      formulation: 'SC',
      concentration: '500 g/L',
      chemical_group: 'Inorgânico',
      manufacturer: 'AgroChem',
      mapa_registration: '67890',
      expiration_date: '2028-12-31',
      registered_for_crop: true,
      target_1: 'Antracnose',
      target_2: null,
      safety_interval_days: 3,
      label_dose: '200',
      dose_unit: 'g/100L',
      observations: null,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    },
  ]);

  const mockMixturesRepo = {
    mixtures: mockMixtures,
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  const mockInputsRepo = {
    inputs: mockInputs,
    findAll: vi.fn(),
  };

  const mockUsersRepo = {
    currentUser: signal({
      id: 'user-1',
      full_name: 'Carlos Agrônomo',
      email: 'carlos@pomar.com',
      avatar_url: '',
      isAdmin: true,
    }),
  };

  const mockAuthRepo = {
    user: signal({
      id: 'user-1',
      email: 'carlos@pomar.com',
      user_metadata: { full_name: 'Carlos Agrônomo' },
    }),
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
    mockMixtures.set([]);
    mockMixturesRepo.findAll.mockResolvedValue({ error: null });
    mockInputsRepo.findAll.mockResolvedValue({ error: null });

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        MixturesViewModel,
        { provide: MixturesRepository, useValue: mockMixturesRepo },
        { provide: InputsRepository, useValue: mockInputsRepo },
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: AuthenticationRepository, useValue: mockAuthRepo },
        { provide: MessageService, useValue: mockMessageService },
        { provide: LoadingService, useValue: mockLoadingService },
      ],
    });

    viewModel = TestBed.inject(MixturesViewModel);
  });

  it('should initialize and load data', async () => {
    await viewModel.loadInitialData();

    expect(mockMixturesRepo.findAll).toHaveBeenCalled();
    expect(mockInputsRepo.findAll).toHaveBeenCalled();
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.loadFailed()).toBe(false);
  });

  it('openCreate should reset form and add an initial empty input slot', () => {
    viewModel.openCreate();

    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.editingMixture()).toBeNull();
    expect(viewModel.form.controls.name.value).toBe('');
    expect(viewModel.form.controls.is_active.value).toBe(true);
    expect(viewModel.inputsArray.length).toBe(1);
  });

  it('selecting an input in onInputChange should populate default dose and unit from input label_dose', () => {
    viewModel.openCreate();
    viewModel.onInputChange(0, 'input-1');

    const group = viewModel.inputsArray.at(0);
    expect(group.get('input_id')?.value).toBe('input-1');
    expect(group.get('dose')?.value).toBe('150');
    expect(group.get('dose_unit')?.value).toBe('ml/100L');
    expect(group.get('input_name')?.value).toBe('Inseticida Alpha');
  });

  it('allows user to customize dose after selection', () => {
    viewModel.openCreate();
    viewModel.onInputChange(0, 'input-1');

    const group = viewModel.inputsArray.at(0);
    group.get('dose')?.setValue('250');

    expect(group.get('dose')?.value).toBe('250');
  });

  it('validates required fields before allowing submission', () => {
    viewModel.openCreate();

    // Empty form cannot submit
    expect(viewModel.canSubmit()).toBe(false);
    expect(viewModel.nameError()).toBeNull(); // not dirty yet

    viewModel.form.controls.name.markAsDirty();
    viewModel.formVersion.update((v) => v + 1);
    expect(viewModel.nameError()).toBe('Informe o nome da calda.');

    viewModel.form.controls.name.setValue('Calda Pré-Florada');
    expect(viewModel.nameError()).toBeNull();

    // Inputs array item not filled
    expect(viewModel.canSubmit()).toBe(false);

    viewModel.onInputChange(0, 'input-1');
    expect(viewModel.canSubmit()).toBe(true);
    expect(viewModel.inputsError()).toBeNull();
  });

  it('submit in create mode should send payload with logged user info and inputs', async () => {
    mockMixturesRepo.create.mockResolvedValue({
      data: { id: 'mix-1' } as unknown as MixtureItem,
      error: null,
    });

    viewModel.openCreate();
    viewModel.form.controls.name.setValue('Calda Especial');
    viewModel.form.controls.observations.setValue('Aplicar no fim da tarde');
    viewModel.onInputChange(0, 'input-1');
    viewModel.inputsArray.at(0).get('dose')?.setValue('180');

    await viewModel.submit();

    expect(mockMixturesRepo.create).toHaveBeenCalledWith({
      name: 'Calda Especial',
      registered_by_name: 'Carlos Agrônomo',
      registered_by_email: 'carlos@pomar.com',
      is_active: true,
      observations: 'Aplicar no fim da tarde',
      inputs: [
        {
          input_id: 'input-1',
          dose: '180',
          dose_unit: 'ml/100L',
        },
      ],
    });

    expect(mockMessageService.success).toHaveBeenCalledWith('Calda cadastrada com sucesso!');
    expect(viewModel.dialogVisible()).toBe(false);
  });

  it('openEdit should populate form with existing mixture and inputs', () => {
    const existing: MixtureItem = {
      id: 'mix-1',
      name: 'Calda Fungicida',
      registered_by_name: 'Pedro',
      registered_by_email: 'pedro@pomar.com',
      is_active: false,
      observations: 'Cuidado com vento',
      created_at: '2026-10-10T00:00:00Z',
      updated_at: '2026-10-10T00:00:00Z',
      inputs: [
        {
          id: 'mi-1',
          mixture_id: 'mix-1',
          input_id: 'input-2',
          dose: '300',
          dose_unit: 'g/100L',
          input: mockInputs()[1],
        },
      ],
    };

    viewModel.openEdit(existing);

    expect(viewModel.dialogVisible()).toBe(true);
    expect(viewModel.editingMixture()).toBe(existing);
    expect(viewModel.form.controls.name.value).toBe('Calda Fungicida');
    expect(viewModel.form.controls.is_active.value).toBe(false);
    expect(viewModel.inputsArray.length).toBe(1);
    expect(viewModel.inputsArray.at(0).get('input_id')?.value).toBe('input-2');
    expect(viewModel.inputsArray.at(0).get('dose')?.value).toBe('300');
  });

  it('should map and translate input types in inputOptions to Portuguese', () => {
    expect(viewModel.translateInputType('ACARICIDE')).toBe('Acaricida');
    expect(viewModel.translateInputType('BIOLOGICAL')).toBe('Biológico');
    expect(viewModel.translateInputType('INSECTICIDE')).toBe('Inseticida');
    expect(viewModel.translateInputType('FUNGICIDE')).toBe('Fungicida');

    const options = viewModel.inputOptions();
    expect(options.length).toBe(2);
    expect(options[0].label).toBe('Inseticida Alpha (Inseticida)');
    expect(options[0].typeLabel).toBe('Inseticida');
    expect(options[1].label).toBe('Fungicida Beta (Fungicida)');
    expect(options[1].typeLabel).toBe('Fungicida');
  });

  it('deleteSingle should call repository and show success message', async () => {
    const mix: MixtureItem = {
      id: 'mix-to-delete',
      name: 'Calda X',
      registered_by_name: 'User',
      registered_by_email: 'user@test.com',
      is_active: true,
      observations: null,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    };

    mockMixturesRepo.deleteMany.mockResolvedValue({ error: null });

    const result = await viewModel.deleteSingle(mix);

    expect(result).toBe(true);
    expect(mockMixturesRepo.deleteMany).toHaveBeenCalledWith(['mix-to-delete']);
    expect(mockMessageService.success).toHaveBeenCalledWith('Calda excluída com sucesso!');
  });
});

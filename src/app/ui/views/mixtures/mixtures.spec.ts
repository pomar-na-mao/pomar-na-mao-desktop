import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticationRepository } from '../../../data/repositories/authentication/authentication-repository';
import { InputsRepository } from '../../../data/repositories/inputs/inputs.repository';
import { MixturesRepository } from '../../../data/repositories/mixtures/mixtures.repository';
import { UsersRepository } from '../../../data/repositories/users/users-repository';
import { MessageService } from '../../../data/services/message/message.service';
import type { InputItem } from '../../../domain/models/input.model';
import type { MixtureItem } from '../../../domain/models/mixture.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { Mixtures } from './mixtures';

describe('Mixtures', () => {
  let fixture: ComponentFixture<Mixtures>;
  let component: Mixtures;

  const sampleInput: InputItem = {
    id: 'input-1',
    name: 'Sivanto Prime',
    type: 'INSECTICIDE',
    active_ingredient: 'Flupiradifurona',
    formulation: 'SL',
    concentration: '200 g/L',
    chemical_group: 'Butenolida',
    manufacturer: 'Bayer',
    mapa_registration: '00123/20',
    expiration_date: '2028-12-31',
    registered_for_crop: true,
    target_1: 'Psilídeo',
    target_2: null,
    safety_interval_days: 7,
    label_dose: '75',
    dose_unit: 'ml/100L',
    observations: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  };

  const sampleMixture: MixtureItem = {
    id: 'mix-1',
    name: 'Calda Inseticida 1',
    registered_by_name: 'Carlos Agrônomo',
    registered_by_email: 'carlos@pomar.com',
    is_active: true,
    observations: 'Aplicar com vento calmo',
    created_at: '2026-10-15T10:00:00Z',
    updated_at: '2026-10-15T11:00:00Z',
    inputs: [
      {
        id: 'mi-1',
        mixture_id: 'mix-1',
        input_id: 'input-1',
        dose: '75',
        dose_unit: 'ml/100L',
        input: sampleInput,
      },
    ],
  };

  const mockMixtures = signal<MixtureItem[]>([sampleMixture]);
  const mockInputs = signal<InputItem[]>([sampleInput]);

  const mockMixturesRepo = {
    mixtures: mockMixtures,
    findAll: vi.fn().mockResolvedValue({ error: null }),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn().mockResolvedValue({ error: null }),
  };

  const mockInputsRepo = {
    inputs: mockInputs,
    findAll: vi.fn().mockResolvedValue({ error: null }),
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

  const messages = { success: vi.fn(), error: vi.fn() };
  const loading = { show: vi.fn(), hide: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockMixtures.set([sampleMixture]);
    mockInputs.set([sampleInput]);
    mockMixturesRepo.findAll.mockResolvedValue({ error: null });
    mockInputsRepo.findAll.mockResolvedValue({ error: null });

    await TestBed.configureTestingModule({
      imports: [Mixtures],
      providers: [
        { provide: MixturesRepository, useValue: mockMixturesRepo },
        { provide: InputsRepository, useValue: mockInputsRepo },
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: AuthenticationRepository, useValue: mockAuthRepo },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Mixtures);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('creates and loads mixtures on initialization', () => {
    expect(component).toBeTruthy();
    expect(mockMixturesRepo.findAll).toHaveBeenCalled();
    expect(mockInputsRepo.findAll).toHaveBeenCalled();
  });

  it('opens details dialog when openDetails is called', () => {
    component.viewModel.openDetails(sampleMixture);
    expect(component.viewModel.detailsDialogVisible()).toBe(true);
    expect(component.viewModel.selectedMixtureForDetails()).toEqual(sampleMixture);

    component.viewModel.closeDetails();
    expect(component.viewModel.detailsDialogVisible()).toBe(false);
  });

  it('triggers confirmation dialog on confirmDelete', () => {
    const confirmationService = component.confirmationService;
    const confirmSpy = vi.spyOn(confirmationService, 'confirm');

    component.confirmDelete(sampleMixture);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Excluir calda',
        message: expect.stringContaining(sampleMixture.name),
      }),
    );
  });

  it('triggers confirmation dialog on confirmDeleteSelected when items are selected', () => {
    const confirmationService = component.confirmationService;
    const confirmSpy = vi.spyOn(confirmationService, 'confirm');

    component.viewModel.selectedMixtures.set([sampleMixture]);
    component.confirmDeleteSelected();

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Excluir caldas selecionadas',
      }),
    );
  });
});

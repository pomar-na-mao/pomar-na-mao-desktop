import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MipdRepository } from '../../../data/repositories/mipd/mipd.repository';
import { MessageService } from '../../../data/services/message/message.service';
import { MipdRegistrationViewModel } from './mipd-registration.view-model';

describe('MipdRegistrationViewModel', () => {
  let viewModel: MipdRegistrationViewModel;
  const mockLoadZones = vi.fn();
  const mockLoadOccurrenceTypes = vi.fn();
  const mockLoadPlants = vi.fn();
  const mockSubmitMarking = vi.fn();
  const mockMessageSuccess = vi.fn();
  const mockMessageError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MipdRegistrationViewModel,
        {
          provide: MipdRepository,
          useValue: {
            zones: vi.fn().mockReturnValue([{ id: 'z1', name: 'Zona 1' }]),
            occurrenceTypes: vi.fn().mockReturnValue([{ id: 'o1', name: 'Cancro' }]),
            plants: vi.fn().mockReturnValue([
              { id: 'p1', latitude: -23.4, longitude: -49.1, zone_id: 'z1' },
            ]),
            loadZones: mockLoadZones,
            loadOccurrenceTypes: mockLoadOccurrenceTypes,
            loadPlants: mockLoadPlants,
            submitMarking: mockSubmitMarking,
          },
        },
        {
          provide: MessageService,
          useValue: {
            success: mockMessageSuccess,
            error: mockMessageError,
          },
        },
      ],
    });

    viewModel = TestBed.inject(MipdRegistrationViewModel);
  });

  it('initializes and loads catalogs', async () => {
    await viewModel.initialize();
    expect(mockLoadZones).toHaveBeenCalled();
    expect(mockLoadOccurrenceTypes).toHaveBeenCalled();
    expect(mockLoadPlants).toHaveBeenCalled();
    expect(viewModel.loading()).toBe(false);
  });

  it('toggles plant parts selection', () => {
    expect(viewModel.selectedPlantParts()).toEqual([]);
    viewModel.togglePlantPart('LEAF');
    expect(viewModel.selectedPlantParts()).toEqual(['LEAF']);
    viewModel.togglePlantPart('FRUIT');
    expect(viewModel.selectedPlantParts()).toEqual(['LEAF', 'FRUIT']);
    viewModel.togglePlantPart('LEAF');
    expect(viewModel.selectedPlantParts()).toEqual(['FRUIT']);
  });

  it('prevents submission if required fields are missing', async () => {
    // Missing plant
    let ok = await viewModel.submit();
    expect(ok).toBe(false);
    expect(mockMessageError).toHaveBeenCalledWith('Selecione uma planta.');

    // Select plant, missing occurrence
    viewModel.selectPlant('p1');
    ok = await viewModel.submit();
    expect(ok).toBe(false);
    expect(mockMessageError).toHaveBeenCalledWith('Selecione a praga ou doença.');

    // Select occurrence, missing parts
    viewModel.selectedOccurrenceTypeId.set('o1');
    ok = await viewModel.submit();
    expect(ok).toBe(false);
    expect(mockMessageError).toHaveBeenCalledWith('Selecione pelo menos uma parte da planta afetada.');
  });

  it('submits marking when form is valid and resets on success', async () => {
    viewModel.selectPlant('p1');
    viewModel.selectedOccurrenceTypeId.set('o1');
    viewModel.togglePlantPart('LEAF');
    mockSubmitMarking.mockResolvedValueOnce({ success: true });

    const ok = await viewModel.submit();
    expect(ok).toBe(true);
    expect(mockSubmitMarking).toHaveBeenCalledWith(
      expect.objectContaining({
        plantId: 'p1',
        occurrenceTypeId: 'o1',
        plantParts: ['LEAF'],
      }),
    );
    expect(mockMessageSuccess).toHaveBeenCalledWith('Marcação de MIPD registrada com sucesso!');
    expect(viewModel.selectedPlantId()).toBe('');
    expect(viewModel.selectedPlantParts()).toEqual([]);
  });
});

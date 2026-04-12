import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NewPlantsRepository } from '../../../data/repositories/new-plants/new-plants-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { NewPlantsService } from '../../../data/services/new-plants/new-plants-service';
import { MessageService } from '../../../data/services/message/message.service';
import { NewPlantsViewModel } from './new-plants.view-model';
import type { INewPlant } from '../../../domain/models/new-plant.model';

describe('NewPlantsViewModel', () => {
  let viewModel: NewPlantsViewModel;

  const newPlantsSignal = signal<INewPlant[]>([
    { id: '1', latitude: -23, longitude: -46, created_at: '2023-01-01T10:00:00Z', is_approved: false, region: 'A', gps_timestamp: null, updated_at: null },
    { id: '2', latitude: -24, longitude: -47, created_at: '2023-01-02T10:00:00Z', is_approved: true, region: 'B', gps_timestamp: null, updated_at: null }
  ]);
  const selectedNewPlantSignal = signal<INewPlant | null>(null);
  const isLoadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  const mockNewPlantsRepository = {
    newPlants: newPlantsSignal.asReadonly(),
    selectedNewPlant: selectedNewPlantSignal.asReadonly(),
    isLoading: isLoadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    fetchNewPlants: vi.fn().mockResolvedValue(undefined),
    setSelectedNewPlantId: vi.fn()
  };

  const mockPlantsRepository = {
    insert: vi.fn()
  };

  const mockNewPlantsService = {
    approveNewPlant: vi.fn()
  };

  const mockMessageService = {
    show: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        NewPlantsViewModel,
        { provide: NewPlantsRepository, useValue: mockNewPlantsRepository },
        { provide: PlantsRepository, useValue: mockPlantsRepository },
        { provide: NewPlantsService, useValue: mockNewPlantsService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    viewModel = TestBed.inject(NewPlantsViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should expose repository state', () => {
    expect(viewModel.newPlants()).toEqual(newPlantsSignal());
    expect(viewModel.isLoading()).toBe(false);
  });

  it('should sort new plants by date descending', () => {
    const sorted = viewModel.sortedNewPlants();
    expect(sorted[0].id).toBe('2'); // Jan 2nd comes before Jan 1st in descending
    expect(sorted[1].id).toBe('1');
  });

  it('openApprovalModal should select plant and open modal', () => {
    viewModel.openApprovalModal('1');
    expect(mockNewPlantsRepository.setSelectedNewPlantId).toHaveBeenCalledWith('1');
    expect(viewModel.isApprovalModalOpen()).toBe(true);
  });

  it('closeApprovalModal should clear selection and close modal', () => {
    viewModel.closeApprovalModal();
    expect(mockNewPlantsRepository.setSelectedNewPlantId).toHaveBeenCalledWith(null);
    expect(viewModel.isApprovalModalOpen()).toBe(false);
  });

  describe('approveSelectedNewPlant', () => {
    it('should call approveNewPlant RPC and reload on success', async () => {
      selectedNewPlantSignal.set(newPlantsSignal()[0]);
      mockNewPlantsService.approveNewPlant.mockResolvedValue({ data: null, error: null });

      await viewModel.approveSelectedNewPlant();

      expect(mockNewPlantsService.approveNewPlant).toHaveBeenCalledWith('1');
      expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.SUCCESS', 'success');
      expect(mockNewPlantsRepository.fetchNewPlants).toHaveBeenCalled();
      expect(viewModel.isApprovalModalOpen()).toBe(false);
    });

    it('should show error toast on failure', async () => {
      selectedNewPlantSignal.set(newPlantsSignal()[0]);
      mockNewPlantsService.approveNewPlant.mockResolvedValue({ data: null, error: { message: 'Failure' } });

      await viewModel.approveSelectedNewPlant();

      expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.ERROR', 'error');
      expect(viewModel.isApproving()).toBe(false);
    });
  });
});

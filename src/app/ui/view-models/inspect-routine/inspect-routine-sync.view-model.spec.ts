import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectAnnotationRepository } from '../../../data/repositories/inspect-annotation/inspect-annotation-repository';
import { InspectRoutinePlantsRepository } from '../../../data/repositories/inspect-routine-plants/inspect-routine-plants-repository';
import { InspectRoutineRepository } from '../../../data/repositories/inspect-routine/inspect-routine-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { InspectRoutineSyncViewModel } from './inspect-routine-sync.view-model';

describe('InspectRoutineSyncViewModel', () => {
  let viewModel: InspectRoutineSyncViewModel;

  const inspectRoutinePlantsSignal = signal<any[]>([]);
  const selectedInspectRoutinePlantSignal = signal<any | null>(null);
  const inspectRoutinesSignal = signal<any[]>([]);
  const inspectRoutineCurrentPlantsSignal = signal<any[]>([]);
  const inspectAnnotationsLoadingSignal = signal(false);

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockInspectRoutinePlantsRepository = {
    inspectRoutinePlants: inspectRoutinePlantsSignal.asReadonly(),
    selectedInspectRoutinePlant: selectedInspectRoutinePlantSignal.asReadonly(),
    findByInspectRoutineId: vi.fn().mockImplementation(async (_routineId: number) => undefined),
    setSelectedPlant: vi.fn().mockImplementation((plant: any) => selectedInspectRoutinePlantSignal.set(plant)),
    approveInspectAnnotation: vi.fn(),
    updatePlantFromInspectRoutine: vi.fn()
  };

  const mockInspectRoutineRepository = {
    inspectRoutines: inspectRoutinesSignal
  };

  const mockPlantsRepository = {
    inspectRoutineCurrentPlants: inspectRoutineCurrentPlantsSignal.asReadonly(),
    findById: vi.fn(),
    addInspectRoutineCurrentPlantsItem: vi.fn().mockImplementation((plant: any) => {
      inspectRoutineCurrentPlantsSignal.update((plants) => [...plants, plant]);
    }),
    clearPlants: vi.fn()
  };

  const mockInspectAnnotationRepository = {
    isLoading: inspectAnnotationsLoadingSignal.asReadonly(),
    fetchInspectAnnotations: vi.fn().mockResolvedValue(undefined)
  };

  const mockMessageService = {
    show: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    inspectRoutinePlantsSignal.set([]);
    selectedInspectRoutinePlantSignal.set(null);
    inspectRoutinesSignal.set([]);
    inspectRoutineCurrentPlantsSignal.set([]);
    inspectAnnotationsLoadingSignal.set(false);

    TestBed.configureTestingModule({
      providers: [
        InspectRoutineSyncViewModel,
        { provide: Router, useValue: mockRouter },
        { provide: InspectRoutinePlantsRepository, useValue: mockInspectRoutinePlantsRepository },
        { provide: InspectRoutineRepository, useValue: mockInspectRoutineRepository },
        { provide: PlantsRepository, useValue: mockPlantsRepository },
        { provide: InspectAnnotationRepository, useValue: mockInspectAnnotationRepository },
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    viewModel = TestBed.inject(InspectRoutineSyncViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should initialize the routine context', () => {
    viewModel.initialize(7);

    expect(viewModel.id()).toBe(7);
    expect(viewModel.currentPlantIndex()).toBe(0);
    expect(mockInspectRoutinePlantsRepository.findByInspectRoutineId).toHaveBeenCalledWith(7);
  });

  it('should compute the current routine region', () => {
    inspectRoutinesSignal.set([
      { id: 7, region: 'North' }
    ]);

    viewModel.id.set(7);

    expect(viewModel.currentRoutineRegion()).toBe('North');
  });

  it('should compute inclusions and exclusions for the selected plant', () => {
    selectedInspectRoutinePlantSignal.set({
      id: 'irp-1',
      plant_id: 'plant-1',
      mites: true,
      flowers: false
    });
    inspectRoutineCurrentPlantsSignal.set([
      {
        id: 'plant-1',
        mites: false,
        flowers: true
      }
    ]);

    expect(viewModel.occurrencesChanges()).toEqual({
      inclusions: ['mites'],
      exclusions: ['flowers']
    });
  });

  it('should skip fetching plant data when the plant is already loaded', async () => {
    inspectRoutineCurrentPlantsSignal.set([{ id: 'plant-1' }]);

    await viewModel.fetchPlantData('plant-1');

    expect(mockPlantsRepository.findById).not.toHaveBeenCalled();
  });

  it('should fetch and cache plant data when needed', async () => {
    mockPlantsRepository.findById.mockResolvedValue({ id: 'plant-2' });

    await viewModel.fetchPlantData('plant-2');

    expect(mockPlantsRepository.findById).toHaveBeenCalledWith('plant-2');
    expect(mockPlantsRepository.addInspectRoutineCurrentPlantsItem).toHaveBeenCalledWith({ id: 'plant-2' });
    expect(viewModel.isPlantLoading()).toBe(false);
  });

  it('should move to the next and previous plants', () => {
    inspectRoutinePlantsSignal.set([
      { id: 'irp-1', plant_id: 'plant-1' },
      { id: 'irp-2', plant_id: 'plant-2' }
    ]);

    viewModel.nextPlant();
    expect(viewModel.currentPlantIndex()).toBe(1);
    expect(mockInspectRoutinePlantsRepository.setSelectedPlant).toHaveBeenLastCalledWith({
      id: 'irp-2',
      plant_id: 'plant-2'
    });

    viewModel.previousPlant();
    expect(viewModel.currentPlantIndex()).toBe(0);
    expect(mockInspectRoutinePlantsRepository.setSelectedPlant).toHaveBeenLastCalledWith({
      id: 'irp-1',
      plant_id: 'plant-1'
    });
  });

  it('should approve an inspection annotation successfully', async () => {
    mockInspectRoutinePlantsRepository.approveInspectAnnotation.mockResolvedValue({ error: null });

    await viewModel.onApproveInspectAnnotation('annotation-1');

    expect(mockInspectRoutinePlantsRepository.approveInspectAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(mockInspectAnnotationRepository.fetchInspectAnnotations).toHaveBeenCalled();
    expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.SUCCESS', 'success');
    expect(viewModel.isApproving()).toBe(false);
  });

  it('should show an error when approving an inspection annotation fails', async () => {
    mockInspectRoutinePlantsRepository.approveInspectAnnotation.mockResolvedValue({ error: new Error('failed') });

    await viewModel.onApproveInspectAnnotation('annotation-1');

    expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.ERROR', 'error');
    expect(viewModel.isApproving()).toBe(false);
  });

  it('should approve a routine plant successfully', async () => {
    const plant = {
      id: 'inspect-routine-plant-1',
      plant_id: 'plant-1',
      region: 'North',
      variety: 'Gala',
      mass: 10,
      life_of_the_tree: 5,
      harvest: '2026',
      planting_date: '2020-01-01',
      description: 'Healthy plant',
      mites: true,
      flowers: false
    };

    selectedInspectRoutinePlantSignal.set(plant);
    inspectRoutinePlantsSignal.set([plant]);
    viewModel.id.set(7);

    mockInspectRoutinePlantsRepository.updatePlantFromInspectRoutine.mockResolvedValue({ error: null });
    mockInspectRoutinePlantsRepository.findByInspectRoutineId.mockImplementation(async () => {
      inspectRoutinePlantsSignal.set([plant]);
      selectedInspectRoutinePlantSignal.set(plant);
    });
    mockPlantsRepository.findById.mockResolvedValue({ id: 'plant-1' });

    await viewModel.onApproveInspectRoutine();

    expect(mockInspectRoutinePlantsRepository.updatePlantFromInspectRoutine).toHaveBeenCalledWith(
      'plant-1',
      expect.objectContaining({
        mites: true,
        flowers: false
      }),
      'inspect-routine-plant-1',
      {
        region: 'North',
        variety: 'Gala',
        mass: 10,
        life_of_the_tree: 5,
        harvest: '2026',
        planting_date: '2020-01-01',
        description: 'Healthy plant'
      }
    );
    expect(mockInspectRoutinePlantsRepository.findByInspectRoutineId).toHaveBeenCalledWith(7);
    expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.SUCCESS', 'success');
    expect(viewModel.isApproving()).toBe(false);
  });

  it('should show an error when approving a routine plant fails', async () => {
    selectedInspectRoutinePlantSignal.set({
      id: 'inspect-routine-plant-1',
      plant_id: 'plant-1',
      region: 'North'
    });
    viewModel.id.set(7);
    mockInspectRoutinePlantsRepository.updatePlantFromInspectRoutine.mockResolvedValue({ error: new Error('failed') });

    await viewModel.onApproveInspectRoutine();

    expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.ERROR', 'error');
    expect(viewModel.isApproving()).toBe(false);
  });

  it('should navigate back and cleanup local plants', () => {
    viewModel.goBack();
    viewModel.cleanup();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/pomar-na-mao/sincronizacoes']);
    expect(mockPlantsRepository.clearPlants).toHaveBeenCalled();
  });
});

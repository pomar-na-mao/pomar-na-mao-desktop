import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlantData } from '../../../domain/models/plant-data.model';
import type { IRoutinePlants } from '../../../domain/models/routine-plants.model';
import type { IRoutine } from '../../../domain/models/routine.model';
//import { WorkAnnotationRepository } from '../../../data/repositories/work-annotation/work-annotation-repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { RoutinePlantsRepository } from '../../../data/repositories/routine-plants/routine-plants-repository';
import { RoutineRepository } from '../../../data/repositories/routine/routine-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { RoutineSyncViewModel } from './routine-sync.view-model';

function createRoutinePlant(
  overrides: Partial<IRoutinePlants> = {},
): IRoutinePlants {
  return {
    id: 'routine-plant-1',
    created_at: '2026-03-31T10:00:00Z',
    routine_id: 7,
    longitude: -46.6,
    latitude: -23.5,
    gps_timestamp: 123456,
    mass: '10',
    variety: 'Gala',
    harvest: '2026',
    description: 'Healthy plant',
    planting_date: '2020-01-01',
    life_of_the_tree: '5',
    stick: false,
    broken_branch: false,
    vine_growing: false,
    burnt_branch: false,
    struck_by_lightning: false,
    drill: false,
    anthill: false,
    in_experiment: false,
    weeds_in_the_basin: false,
    fertilization_or_manuring: false,
    mites: false,
    thrips: false,
    empty_collection_box_near: false,
    is_dead: false,
    region: 'North',
    updated_at: '2026-03-31T10:00:00Z',
    plant_id: 'plant-1',
    is_new: false,
    non_existent: false,
    frost: false,
    flowers: false,
    buds: false,
    dehydrated: false,
    is_approved: false,
    ...overrides,
  };
}

function createRoutine(overrides: Partial<IRoutine> = {}): IRoutine {
  return {
    id: 7,
    date: '2026-03-31T10:00:00Z',
    region: 'North',
    is_done: false,
    created_at: '2026-03-31T10:00:00Z',
    description: 'Routine description',
    updated_at: '2026-03-31T10:00:00Z',
    is_review_started: false,
    ...overrides,
  };
}

function createPlantData(overrides: Partial<PlantData> = {}): PlantData {
  return {
    id: 'plant-1',
    created_at: '2026-03-31T10:00:00Z',
    updated_at: '2026-03-31T10:00:00Z',
    longitude: -46.6,
    latitude: -23.5,
    gps_timestamp: 123456,
    photo_file: null,
    mass: '10',
    variety: 'Gala',
    harvest: '2026',
    description: 'Healthy plant',
    planting_date: '2020-01-01',
    life_of_the_tree: '5',
    stick: false,
    broken_branch: false,
    vine_growing: false,
    burnt_branch: false,
    struck_by_lightning: false,
    drill: false,
    anthill: false,
    in_experiment: false,
    weeds_in_the_basin: false,
    fertilization_or_manuring: false,
    mites: false,
    thrips: false,
    region: 'North',
    empty_collection_box_near: false,
    is_dead: false,
    is_new: false,
    non_existent: false,
    frost: false,
    flowers: false,
    buds: false,
    dehydrated: false,
    ...overrides,
  };
}

describe('RoutineSyncViewModel', () => {
  let viewModel: RoutineSyncViewModel;

  const routinePlantsSignal = signal<IRoutinePlants[]>([]);
  const selectedRoutinePlantSignal = signal<IRoutinePlants | null>(null);
  const routinesSignal = signal<IRoutine[]>([]);
  const routineCurrentPlantsSignal = signal<PlantData[]>([]);
  const workAnnotationsLoadingSignal = signal(false);

  const mockRouter = {
    navigate: vi.fn(),
  };

  const mockRoutinePlantsRepository = {
    routinePlants: routinePlantsSignal.asReadonly(),
    selectedRoutinePlant: selectedRoutinePlantSignal.asReadonly(),
    findByRoutineId: vi.fn().mockImplementation(async () => undefined),
    setSelectedPlant: vi
      .fn()
      .mockImplementation((plant: IRoutinePlants | null) =>
        selectedRoutinePlantSignal.set(plant),
      ),
    approveWorkAnnotation: vi.fn(),
    updatePlantFromRoutine: vi.fn(),
  };

  const mockRoutineRepository = {
    routines: routinesSignal,
  };

  const mockPlantsRepository = {
    routineCurrentPlants: routineCurrentPlantsSignal.asReadonly(),
    findById: vi.fn(),
    addRoutineCurrentPlantsItem: vi
      .fn()
      .mockImplementation((plant: PlantData) => {
        routineCurrentPlantsSignal.update((plants) => [...plants, plant]);
      }),
    clearPlants: vi.fn(),
  };

  /* const mockWorkAnnotationRepository = {
    isLoading: workAnnotationsLoadingSignal.asReadonly(),
    fetchWorkAnnotations: vi.fn().mockResolvedValue(undefined),
  }; */

  const mockMessageService = {
    show: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    routinePlantsSignal.set([]);
    selectedRoutinePlantSignal.set(null);
    routinesSignal.set([]);
    routineCurrentPlantsSignal.set([]);
    workAnnotationsLoadingSignal.set(false);

    TestBed.configureTestingModule({
      providers: [
        RoutineSyncViewModel,
        { provide: Router, useValue: mockRouter },
        {
          provide: RoutinePlantsRepository,
          useValue: mockRoutinePlantsRepository,
        },
        { provide: RoutineRepository, useValue: mockRoutineRepository },
        { provide: PlantsRepository, useValue: mockPlantsRepository },
        /* { provide: WorkAnnotationRepository, useValue: mockWorkAnnotationRepository }, */
        { provide: MessageService, useValue: mockMessageService },
      ],
    });

    viewModel = TestBed.inject(RoutineSyncViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should initialize the routine context', () => {
    viewModel.initialize(7);

    expect(viewModel.id()).toBe(7);
    expect(viewModel.currentPlantIndex()).toBe(0);
    expect(mockRoutinePlantsRepository.findByRoutineId).toHaveBeenCalledWith(7);
  });

  it('should compute the current routine region', () => {
    routinesSignal.set([createRoutine()]);

    viewModel.id.set(7);

    expect(viewModel.currentRoutineRegion()).toBe('North');
  });

  it('should compute inclusions and exclusions for the selected plant', () => {
    selectedRoutinePlantSignal.set(
      createRoutinePlant({
        id: 'irp-1',
        plant_id: 'plant-1',
        mites: true,
        flowers: false,
      }),
    );
    routineCurrentPlantsSignal.set([
      createPlantData({
        id: 'plant-1',
        mites: false,
        flowers: true,
      }),
    ]);

    expect(viewModel.occurrencesChanges()).toEqual({
      inclusions: ['mites'],
      exclusions: ['flowers'],
    });
  });

  it('should skip fetching plant data when the plant is already loaded', async () => {
    routineCurrentPlantsSignal.set([createPlantData()]);

    await viewModel.fetchPlantData('plant-1');

    expect(mockPlantsRepository.findById).not.toHaveBeenCalled();
  });

  it('should fetch and cache plant data when needed', async () => {
    const plant = createPlantData({ id: 'plant-2' });
    mockPlantsRepository.findById.mockResolvedValue(plant);

    await viewModel.fetchPlantData('plant-2');

    expect(mockPlantsRepository.findById).toHaveBeenCalledWith('plant-2');
    expect(
      mockPlantsRepository.addRoutineCurrentPlantsItem,
    ).toHaveBeenCalledWith(plant);
    expect(viewModel.isPlantLoading()).toBe(false);
  });

  it('should move to the next and previous plants', () => {
    routinePlantsSignal.set([
      createRoutinePlant({ id: 'irp-1', plant_id: 'plant-1' }),
      createRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }),
    ]);

    viewModel.nextPlant();
    expect(viewModel.currentPlantIndex()).toBe(1);
    expect(
      mockRoutinePlantsRepository.setSelectedPlant,
    ).toHaveBeenLastCalledWith(
      createRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }),
    );

    viewModel.previousPlant();
    expect(viewModel.currentPlantIndex()).toBe(0);
    expect(
      mockRoutinePlantsRepository.setSelectedPlant,
    ).toHaveBeenLastCalledWith(
      createRoutinePlant({ id: 'irp-1', plant_id: 'plant-1' }),
    );
  });

  /* it('should approve an workion annotation successfully', async () => {
    mockRoutinePlantsRepository.approveWorkAnnotation.mockResolvedValue({ error: null });

    await viewModel.onApproveWorkAnnotation('annotation-1');

    expect(mockRoutinePlantsRepository.approveWorkAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(mockWorkAnnotationRepository.fetchWorkAnnotations).toHaveBeenCalled();
    expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.SUCCESS', 'success');
    expect(viewModel.isApproving()).toBe(false);
  }); */

  /* it('should show an error when approving an workion annotation fails', async () => {
    mockRoutinePlantsRepository.approveWorkAnnotation.mockResolvedValue({ error: new Error('failed') });

    await viewModel.onApproveWorkAnnotation('annotation-1');

    expect(mockMessageService.show).toHaveBeenCalledWith('COMMON.TOAST.ERROR', 'error');
    expect(viewModel.isApproving()).toBe(false);
  }); */

  it('should approve a routine plant successfully', async () => {
    const plant = createRoutinePlant({
      id: 'routine-plant-1',
      plant_id: 'plant-1',
      region: 'North',
      variety: 'Gala',
      mass: '10',
      life_of_the_tree: '5',
      harvest: '2026',
      planting_date: '2020-01-01',
      description: 'Healthy plant',
      mites: true,
      flowers: false,
    });

    selectedRoutinePlantSignal.set(plant);
    routinePlantsSignal.set([plant]);
    viewModel.id.set(7);

    mockRoutinePlantsRepository.updatePlantFromRoutine.mockResolvedValue({
      error: null,
    });
    mockRoutinePlantsRepository.findByRoutineId.mockImplementation(async () => {
      routinePlantsSignal.set([plant]);
      selectedRoutinePlantSignal.set(plant);
    });
    mockPlantsRepository.findById.mockResolvedValue(createPlantData());

    await viewModel.onApproveRoutine();

    expect(
      mockRoutinePlantsRepository.updatePlantFromRoutine,
    ).toHaveBeenCalledWith(
      'plant-1',
      expect.objectContaining({
        mites: true,
        flowers: false,
      }),
      'routine-plant-1',
      {
        region: 'North',
        variety: 'Gala',
        mass: '10',
        life_of_the_tree: '5',
        harvest: '2026',
        planting_date: '2020-01-01',
        description: 'Healthy plant',
      },
    );
    expect(mockRoutinePlantsRepository.findByRoutineId).toHaveBeenCalledWith(7);
    expect(mockMessageService.show).toHaveBeenCalledWith(
      'COMMON.TOAST.SUCCESS',
      'success',
    );
    expect(viewModel.isApproving()).toBe(false);
  });

  it('should show an error when approving a routine plant fails', async () => {
    selectedRoutinePlantSignal.set(
      createRoutinePlant({
        id: 'routine-plant-1',
        plant_id: 'plant-1',
        region: 'North',
      }),
    );
    viewModel.id.set(7);
    mockRoutinePlantsRepository.updatePlantFromRoutine.mockResolvedValue({
      error: new Error('failed'),
    });

    await viewModel.onApproveRoutine();

    expect(mockMessageService.show).toHaveBeenCalledWith(
      'COMMON.TOAST.ERROR',
      'error',
    );
    expect(viewModel.isApproving()).toBe(false);
  });

  it('should navigate back and cleanup local plants', () => {
    viewModel.goBack();
    viewModel.cleanup();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/sincronizacoes',
    ]);
    expect(mockPlantsRepository.clearPlants).toHaveBeenCalled();
  });
});

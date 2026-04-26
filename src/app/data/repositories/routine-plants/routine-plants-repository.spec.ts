import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IRoutinePlants } from '../../../domain/models/routine-plants.model';
import { RoutinePlantsService } from '../../services/routine-plants/routine-plants-service';
import { RoutinePlantsRepository } from './routine-plants-repository';

function createRoutinePlant(overrides: Partial<IRoutinePlants> = {}): IRoutinePlants {
  return {
    id: 'irp-1',
    created_at: '2026-03-31T10:00:00Z',
    routine_id: 7,
    longitude: -46.6,
    latitude: -23.5,
    gps_timestamp: 123456,
    mass: '10',
    variety: 'Gala',
    harvest: '2026',
    description: 'Plant description',
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
    ...overrides
  };
}

describe('RoutinePlantsRepository', () => {
  let repo: RoutinePlantsRepository;

  const findByRoutineId = vi.fn();
  const updatePlantFromRoutine = vi.fn();
  const approveWorkAnnotation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RoutinePlantsRepository,
        {
          provide: RoutinePlantsService,
          useValue: {
            findByRoutineId,
            updatePlantFromRoutine,
            approveWorkAnnotation
          }
        }
      ]
    });

    repo = TestBed.inject(RoutinePlantsRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('findByRoutineId should load plants and select the first one', async () => {
    const plants = [
      createRoutinePlant(),
      createRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' })
    ];
    findByRoutineId.mockResolvedValue({ data: plants, error: null });

    await repo.findByRoutineId(7);

    expect(repo.routinePlants()).toEqual(plants);
    expect(repo.selectedRoutinePlant()).toEqual(plants[0]);
    expect(repo.error()).toBeNull();
    expect(repo.isLoading()).toBe(false);
  });

  it('findByRoutineId should clear the selection when the list is empty', async () => {
    findByRoutineId.mockResolvedValue({ data: [], error: null });

    await repo.findByRoutineId(7);

    expect(repo.routinePlants()).toEqual([]);
    expect(repo.selectedRoutinePlant()).toBeNull();
  });

  it('findByRoutineId should store an error on failure', async () => {
    findByRoutineId.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.findByRoutineId(7);

    expect(repo.error()).toContain('Error fetching routine plants');
    expect(repo.isLoading()).toBe(false);
  });

  it('setSelectedPlant should update the selected plant', () => {
    repo.setSelectedPlant(createRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }));

    expect(repo.selectedRoutinePlant()).toEqual(createRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }));
  });

  it('updatePlantFromRoutine should delegate to the service', async () => {
    updatePlantFromRoutine.mockResolvedValue({ data: null, error: null });

    const result = await repo.updatePlantFromRoutine('plant-1', { mites: true }, 'irp-1', { region: 'North' });

    expect(updatePlantFromRoutine).toHaveBeenCalledWith('plant-1', { mites: true }, 'irp-1', { region: 'North' });
    expect(result).toEqual({ data: null, error: null });
  });

  it('approveWorkAnnotation should delegate to the service', async () => {
    approveWorkAnnotation.mockResolvedValue({ data: null, error: null });

    const result = await repo.approveWorkAnnotation('annotation-1');

    expect(approveWorkAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(result).toEqual({ data: null, error: null });
  });
});

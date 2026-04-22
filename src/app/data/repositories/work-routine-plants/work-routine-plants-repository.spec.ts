import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IWorkRoutinePlants } from '../../../domain/models/work-routine-plants.model';
import { WorkRoutinePlantsService } from '../../services/work-routine-plants/work-routine-plants-service';
import { WorkRoutinePlantsRepository } from './work-routine-plants-repository';

function createWorkRoutinePlant(overrides: Partial<IWorkRoutinePlants> = {}): IWorkRoutinePlants {
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

describe('WorkRoutinePlantsRepository', () => {
  let repo: WorkRoutinePlantsRepository;

  const findByWorkRoutineId = vi.fn();
  const updatePlantFromWorkRoutine = vi.fn();
  const approveWorkAnnotation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WorkRoutinePlantsRepository,
        {
          provide: WorkRoutinePlantsService,
          useValue: {
            findByWorkRoutineId,
            updatePlantFromWorkRoutine,
            approveWorkAnnotation
          }
        }
      ]
    });

    repo = TestBed.inject(WorkRoutinePlantsRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('findByWorkRoutineId should load plants and select the first one', async () => {
    const plants = [
      createWorkRoutinePlant(),
      createWorkRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' })
    ];
    findByWorkRoutineId.mockResolvedValue({ data: plants, error: null });

    await repo.findByWorkRoutineId(7);

    expect(repo.workRoutinePlants()).toEqual(plants);
    expect(repo.selectedWorkRoutinePlant()).toEqual(plants[0]);
    expect(repo.error()).toBeNull();
    expect(repo.isLoading()).toBe(false);
  });

  it('findByWorkRoutineId should clear the selection when the list is empty', async () => {
    findByWorkRoutineId.mockResolvedValue({ data: [], error: null });

    await repo.findByWorkRoutineId(7);

    expect(repo.workRoutinePlants()).toEqual([]);
    expect(repo.selectedWorkRoutinePlant()).toBeNull();
  });

  it('findByWorkRoutineId should store an error on failure', async () => {
    findByWorkRoutineId.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.findByWorkRoutineId(7);

    expect(repo.error()).toContain('Error fetching work routine plants');
    expect(repo.isLoading()).toBe(false);
  });

  it('setSelectedPlant should update the selected plant', () => {
    repo.setSelectedPlant(createWorkRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }));

    expect(repo.selectedWorkRoutinePlant()).toEqual(createWorkRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }));
  });

  it('updatePlantFromWorkRoutine should delegate to the service', async () => {
    updatePlantFromWorkRoutine.mockResolvedValue({ data: null, error: null });

    const result = await repo.updatePlantFromWorkRoutine('plant-1', { mites: true }, 'irp-1', { region: 'North' });

    expect(updatePlantFromWorkRoutine).toHaveBeenCalledWith('plant-1', { mites: true }, 'irp-1', { region: 'North' });
    expect(result).toEqual({ data: null, error: null });
  });

  it('approveWorkAnnotation should delegate to the service', async () => {
    approveWorkAnnotation.mockResolvedValue({ data: null, error: null });

    const result = await repo.approveWorkAnnotation('annotation-1');

    expect(approveWorkAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(result).toEqual({ data: null, error: null });
  });
});

import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IInspectRoutinePlants } from '../../../domain/models/inspect-routine-plants.model';
import { InspectRoutinePlantsService } from '../../services/inspect-routine-plants/inspect-routine-plants-service';
import { InspectRoutinePlantsRepository } from './inspect-routine-plants-repository';

function createInspectRoutinePlant(overrides: Partial<IInspectRoutinePlants> = {}): IInspectRoutinePlants {
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

describe('InspectRoutinePlantsRepository', () => {
  let repo: InspectRoutinePlantsRepository;

  const findByInspectRoutineId = vi.fn();
  const updatePlantFromInspectRoutine = vi.fn();
  const approveInspectAnnotation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        InspectRoutinePlantsRepository,
        {
          provide: InspectRoutinePlantsService,
          useValue: {
            findByInspectRoutineId,
            updatePlantFromInspectRoutine,
            approveInspectAnnotation
          }
        }
      ]
    });

    repo = TestBed.inject(InspectRoutinePlantsRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('findByInspectRoutineId should load plants and select the first one', async () => {
    const plants = [
      createInspectRoutinePlant(),
      createInspectRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' })
    ];
    findByInspectRoutineId.mockResolvedValue({ data: plants, error: null });

    await repo.findByInspectRoutineId(7);

    expect(repo.inspectRoutinePlants()).toEqual(plants);
    expect(repo.selectedInspectRoutinePlant()).toEqual(plants[0]);
    expect(repo.error()).toBeNull();
    expect(repo.isLoading()).toBe(false);
  });

  it('findByInspectRoutineId should clear the selection when the list is empty', async () => {
    findByInspectRoutineId.mockResolvedValue({ data: [], error: null });

    await repo.findByInspectRoutineId(7);

    expect(repo.inspectRoutinePlants()).toEqual([]);
    expect(repo.selectedInspectRoutinePlant()).toBeNull();
  });

  it('findByInspectRoutineId should store an error on failure', async () => {
    findByInspectRoutineId.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.findByInspectRoutineId(7);

    expect(repo.error()).toContain('Error fetching inspect routine plants');
    expect(repo.isLoading()).toBe(false);
  });

  it('setSelectedPlant should update the selected plant', () => {
    repo.setSelectedPlant(createInspectRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }));

    expect(repo.selectedInspectRoutinePlant()).toEqual(createInspectRoutinePlant({ id: 'irp-2', plant_id: 'plant-2' }));
  });

  it('updatePlantFromInspectRoutine should delegate to the service', async () => {
    updatePlantFromInspectRoutine.mockResolvedValue({ data: null, error: null });

    const result = await repo.updatePlantFromInspectRoutine('plant-1', { mites: true }, 'irp-1', { region: 'North' });

    expect(updatePlantFromInspectRoutine).toHaveBeenCalledWith('plant-1', { mites: true }, 'irp-1', { region: 'North' });
    expect(result).toEqual({ data: null, error: null });
  });

  it('approveInspectAnnotation should delegate to the service', async () => {
    approveInspectAnnotation.mockResolvedValue({ data: null, error: null });

    const result = await repo.approveInspectAnnotation('annotation-1');

    expect(approveInspectAnnotation).toHaveBeenCalledWith('annotation-1');
    expect(result).toEqual({ data: null, error: null });
  });
});

import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectRoutinePlantsService } from '../../services/inspect-routine-plants/inspect-routine-plants-service';
import { InspectRoutinePlantsRepository } from './inspect-routine-plants-repository';

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
    const plants = [{ id: 'irp-1' }, { id: 'irp-2' }];
    findByInspectRoutineId.mockResolvedValue({ data: plants, error: null });

    await repo.findByInspectRoutineId(7);

    expect(repo.inspectRoutinePlants()).toEqual(plants);
    expect(repo.selectedInspectRoutinePlant()).toEqual({ id: 'irp-1' });
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
    repo.setSelectedPlant({ id: 'irp-2' } as any);

    expect(repo.selectedInspectRoutinePlant()).toEqual({ id: 'irp-2' });
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

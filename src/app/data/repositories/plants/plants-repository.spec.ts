import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PlantsRepository } from './plants-repository';
import { PlantsService } from '../../services/plants/plants-service';
import type { Plant } from '../../../domain/models/plant-data.model';

describe('PlantsRepository', () => {
  let repo: PlantsRepository;
  const mockFindAll = vi.fn();
  const mockFindById = vi.fn();
  const mockDelete = vi.fn();
  const mockInsert = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        PlantsRepository,
        {
          provide: PlantsService,
          useValue: {
            findAll: mockFindAll,
            findById: mockFindById,
            delete: mockDelete,
            insert: mockInsert,
          },
        },
      ],
    });

    repo = TestBed.inject(PlantsRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('findAll should update plants signal', async () => {
    const mockPlants = [{ id: '1', variety: 'Apple' }] as Plant[];
    mockFindAll.mockResolvedValue({ data: mockPlants, error: null });

    await repo.findAll();

    expect(mockFindAll).toHaveBeenCalled();
    expect(repo.plants()).toEqual(mockPlants);
  });

  it('queryPlants should return data without updating plants signal', async () => {
    const mockPlants = [{ id: '1', variety: 'Apple' }] as Plant[];
    mockFindAll.mockResolvedValue({ data: mockPlants, error: null });
    repo.plants.set([]);

    const result = await repo.queryPlants({ region: 'North', occurrence: '' });

    expect(mockFindAll).toHaveBeenCalledWith({ region: 'North', occurrence: '' });
    expect(result).toEqual(mockPlants);
    expect(repo.plants()).toEqual([]);
  });

  it('findById should return plant from service', async () => {
    const mockPlant = { id: '1', variety: 'Apple' } as Plant;
    mockFindById.mockResolvedValue({ data: mockPlant, error: null });

    const result = await repo.findById('1');

    expect(mockFindById).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockPlant);
  });

  it('delete should remove plant from signal', async () => {
    const initialPlants = [{ id: '1' }, { id: '2' }] as Plant[];
    repo.plants.set(initialPlants);
    mockDelete.mockResolvedValue({ error: null });

    await repo.delete('1');

    expect(mockDelete).toHaveBeenCalledWith('1');
    expect(repo.plants()).toEqual([{ id: '2' }]);
  });

  it('insert should add plant to signal', async () => {
    const newPlant = { id: '3', variety: 'Orange' } as Plant;
    mockInsert.mockResolvedValue({ data: newPlant, error: null });

    await repo.insert(newPlant);

    expect(mockInsert).toHaveBeenCalledWith(newPlant);
    expect(repo.plants()).toContain(newPlant);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NewPlantsRepository } from './new-plants-repository';
import { NewPlantsService } from '../../services/new-plants/new-plants-service';
import type { INewPlant } from '../../../domain/models/new-plant.model';

describe('NewPlantsRepository', () => {
  let repo: NewPlantsRepository;
  const mockGetNewPlants = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        NewPlantsRepository,
        {
          provide: NewPlantsService,
          useValue: {
            getNewPlants: mockGetNewPlants,
          },
        },
      ],
    });

    repo = TestBed.inject(NewPlantsRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('fetchNewPlants should update newPlants signal', async () => {
    const mockPlants = [{ id: '1', latitude: 10, longitude: 20, is_approved: false }] as INewPlant[];
    mockGetNewPlants.mockResolvedValue({ data: mockPlants, error: null });

    await repo.fetchNewPlants();

    expect(mockGetNewPlants).toHaveBeenCalled();
    expect(repo.newPlants()).toEqual(mockPlants);
    expect(repo.isLoading()).toBe(false);
    expect(repo.error()).toBeNull();
  });

  it('fetchNewPlants should set error signal on failure', async () => {
    mockGetNewPlants.mockResolvedValue({ data: null, error: { message: 'Database error' } });

    await repo.fetchNewPlants();

    expect(repo.error()).toContain('Error fetching new plants');
    expect(repo.isLoading()).toBe(false);
  });

  it('setSelectedNewPlantId should update selectedNewPlant computed signal', () => {
    const mockPlants = [
      { id: '1', latitude: 10, longitude: 20, is_approved: false },
      { id: '2', latitude: 30, longitude: 40, is_approved: true }
    ] as INewPlant[];
    
    // Set internal signal state manually for testing computed
    (repo as unknown as { _newPlants: { set: (v: INewPlant[]) => void } })._newPlants.set(mockPlants);

    repo.setSelectedNewPlantId('2');
    expect(repo.selectedNewPlant()).toEqual(mockPlants[1]);

    repo.setSelectedNewPlantId('non-existent');
    expect(repo.selectedNewPlant()).toBeNull();

    repo.setSelectedNewPlantId(null);
    expect(repo.selectedNewPlant()).toBeNull();
  });
});

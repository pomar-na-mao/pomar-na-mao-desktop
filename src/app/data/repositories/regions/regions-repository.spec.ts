import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegionsService } from '../../services/regions/regions-service';
import { RegionsRepository } from './regions-repository';

describe('RegionsRepository', () => {
  let repo: RegionsRepository;

  const findAll = vi.fn();
  const findById = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RegionsRepository,
        {
          provide: RegionsService,
          useValue: {
            findAll,
            findById
          }
        }
      ]
    });

    repo = TestBed.inject(RegionsRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('findAll should update the regions signal', async () => {
    const regions = [{ id: 'region-1' }];
    findAll.mockResolvedValue({ data: regions, error: null });

    await repo.findAll();

    expect(repo.regions()).toEqual(regions);
  });

  it('findById should store the current region and return it on success', async () => {
    const region = { id: 'region-1' };
    findById.mockResolvedValue({ data: region, error: null });

    const result = await repo.findById('region-1');

    expect(findById).toHaveBeenCalledWith('region-1');
    expect(repo.currentRegion()).toEqual(region);
    expect(result).toEqual(region);
  });

  it('findById should clear the current region and return null on failure', async () => {
    repo.currentRegion.set({ id: 'region-1' } as any);
    findById.mockResolvedValue({ data: null, error: new Error('failed') });

    const result = await repo.findById('region-1');

    expect(repo.currentRegion()).toBeNull();
    expect(result).toBeNull();
  });
});

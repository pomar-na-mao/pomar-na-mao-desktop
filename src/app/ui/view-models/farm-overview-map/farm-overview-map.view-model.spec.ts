import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import type { Region } from '../../../domain/models/regions.model';
import { FarmOverviewMapViewModel } from './farm-overview-map.view-model';

function createRegion(overrides: Partial<Region> = {}): Region {
  return {
    id: 'r1',
    created_at: '2026-03-31T10:00:00Z',
    longitude: -46.6,
    latitude: -23.5,
    region: 'North',
    ...overrides
  };
}

describe('FarmOverviewMapViewModel', () => {
  let viewModel: FarmOverviewMapViewModel;

  const regionsSignal = signal<Region[]>([
    createRegion(),
    createRegion({ id: 'r2', longitude: -46.7, latitude: -23.6, region: ' north ' }),
    createRegion({ id: 'r3', longitude: -46.8, latitude: -23.7, region: 'South' })
  ]);

  const mockRegionsRepository = {
    regions: regionsSignal,
    findAll: vi.fn().mockImplementation(async () => undefined)
  };

  const mockPlantsRepository = {
    queryPlants: vi.fn().mockResolvedValue([])
  };

  beforeEach(() => {
    vi.clearAllMocks();

    regionsSignal.set([
      createRegion(),
      createRegion({ id: 'r2', longitude: -46.7, latitude: -23.6, region: ' north ' }),
      createRegion({ id: 'r3', longitude: -46.8, latitude: -23.7, region: 'South' })
    ]);

    TestBed.configureTestingModule({
      providers: [
        FarmOverviewMapViewModel,
        { provide: PlantsRepository, useValue: mockPlantsRepository },
        { provide: RegionsRepository, useValue: mockRegionsRepository }
      ]
    });

    viewModel = TestBed.inject(FarmOverviewMapViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should derive unique regions and region options', () => {
    expect(viewModel.uniqueRegions().map((region) => region.id)).toEqual(['r1', 'r3']);
    expect(viewModel.regionOptions()).toEqual([
      { value: 'r1', label: 'North' },
      { value: 'r3', label: 'South' }
    ]);
  });

  it('should load regions', async () => {
    await viewModel.loadRegions();

    expect(mockRegionsRepository.findAll).toHaveBeenCalled();
    expect(viewModel.isLoadingRegions()).toBe(false);
  });

  it('should load plants for given filters', async () => {
    await viewModel.loadPlants('North', 'mites', 'Gala');

    expect(mockPlantsRepository.queryPlants).toHaveBeenCalledWith({
      region: 'North',
      occurrence: 'mites',
      variety: 'Gala'
    });
  });

  it('should find a region by id', () => {
    const region = viewModel.findRegionById('r1');
    expect(region?.id).toBe('r1');
    expect(region?.region).toBe('North');
  });
});


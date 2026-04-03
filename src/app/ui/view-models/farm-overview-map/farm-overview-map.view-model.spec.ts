import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Plant } from '../../../domain/models/plant-data.model';
import type { Region } from '../../../domain/models/regions.model';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
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

function createPlant(overrides: Partial<Plant> = {}): Plant {
  return {
    id: 'plant-1',
    created_at: '2026-03-31T10:00:00Z',
    longitude: -46.6,
    latitude: -23.5,
    gps_timestamp: 123456,
    mass: '10',
    harvest: '2026',
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
    variety: 'Gala',
    region: 'North',
    is_dead: false,
    is_new: false,
    non_existent: false,
    frost: false,
    flowers: false,
    buds: false,
    dehydrated: false,
    updated_at: '2026-03-31T10:00:00Z',
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

  const currentRegionSignal = signal<Region | null>(null);
  const plantsSignal = signal<Plant[]>([createPlant()]);

  const mockRegionsRepository = {
    regions: regionsSignal,
    currentRegion: currentRegionSignal,
    findAll: vi.fn().mockImplementation(async () => undefined)
  };

  const mockPlantsRepository = {
    plants: plantsSignal,
    findAll: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();
    currentRegionSignal.set(null);
    plantsSignal.set([createPlant()]);
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

  it('should load regions and NOT fetch plants initially (no auto-selection)', async () => {
    await viewModel.loadRegions();

    expect(mockRegionsRepository.findAll).toHaveBeenCalled();
    expect(viewModel.selectedRegionId()).toBe('');
    expect(currentRegionSignal()).toBeNull();
    expect(mockPlantsRepository.findAll).not.toHaveBeenCalled();
    expect(viewModel.isLoadingRegions()).toBe(false);
  });

  it('should change the region and reload plants', async () => {
    await viewModel.onRegionChange('r3');

    expect(viewModel.selectedRegionId()).toBe('r3');
    expect(currentRegionSignal()?.id).toBe('r3');
    expect(mockPlantsRepository.findAll).toHaveBeenCalledWith({
      region: 'South',
      occurrence: '',
      variety: ''
    });
  });

  it('should clear selection when the region is not found', async () => {
    await viewModel.onRegionChange('missing-region');

    expect(currentRegionSignal()).toBeNull();
    expect(plantsSignal()).toEqual([]);
  });

  it('should apply the occurrence filter using the current region', async () => {
    viewModel.selectedRegionId.set('r1');

    await viewModel.onOccurrenceChange('mites');

    expect(viewModel.selectedOccurrenceKey()).toBe('mites');
    expect(mockPlantsRepository.findAll).toHaveBeenCalledWith({
      region: 'North',
      occurrence: 'mites',
      variety: ''
    });
  });

  it('should apply the variety filter using the current region', async () => {
    viewModel.selectedRegionId.set('r1');

    await viewModel.onVarietyChange('Gala');

    expect(viewModel.selectedVariety()).toBe('Gala');
    expect(mockPlantsRepository.findAll).toHaveBeenCalledWith({
      region: 'North',
      occurrence: '',
      variety: 'Gala'
    });
  });
});

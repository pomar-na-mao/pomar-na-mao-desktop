import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { FarmOverviewMapViewModel } from './farm-overview-map.view-model';

describe('FarmOverviewMapViewModel', () => {
  let viewModel: FarmOverviewMapViewModel;

  const regionsSignal = signal([
    {
      id: 'r1',
      created_at: '2026-03-31T10:00:00Z',
      longitude: -46.6,
      latitude: -23.5,
      region: 'North'
    },
    {
      id: 'r2',
      created_at: '2026-03-31T10:00:00Z',
      longitude: -46.7,
      latitude: -23.6,
      region: ' north '
    },
    {
      id: 'r3',
      created_at: '2026-03-31T10:00:00Z',
      longitude: -46.8,
      latitude: -23.7,
      region: 'South'
    }
  ]);

  const currentRegionSignal = signal<any | null>(null);
  const plantsSignal = signal([{ id: 'plant-1' }]);

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
    plantsSignal.set([{ id: 'plant-1' }]);
    regionsSignal.set([
      {
        id: 'r1',
        created_at: '2026-03-31T10:00:00Z',
        longitude: -46.6,
        latitude: -23.5,
        region: 'North'
      },
      {
        id: 'r2',
        created_at: '2026-03-31T10:00:00Z',
        longitude: -46.7,
        latitude: -23.6,
        region: ' north '
      },
      {
        id: 'r3',
        created_at: '2026-03-31T10:00:00Z',
        longitude: -46.8,
        latitude: -23.7,
        region: 'South'
      }
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

  it('should load regions and fetch plants for the first available region', async () => {
    await viewModel.loadRegions();

    expect(mockRegionsRepository.findAll).toHaveBeenCalled();
    expect(viewModel.selectedRegionId()).toBe('r1');
    expect(currentRegionSignal()?.id).toBe('r1');
    expect(mockPlantsRepository.findAll).toHaveBeenCalledWith({
      region: 'North',
      occurrence: ''
    });
    expect(viewModel.isLoadingRegions()).toBe(false);
  });

  it('should change the region and reload plants', async () => {
    await viewModel.onRegionChange('r3');

    expect(viewModel.selectedRegionId()).toBe('r3');
    expect(currentRegionSignal()?.id).toBe('r3');
    expect(mockPlantsRepository.findAll).toHaveBeenCalledWith({
      region: 'South',
      occurrence: ''
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
      occurrence: 'mites'
    });
  });
});

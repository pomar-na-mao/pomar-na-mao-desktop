import { PLATFORM_ID, signal } from '@angular/core';
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

  const mockRegionsRepository = {
    regions: regionsSignal,
    currentRegion: currentRegionSignal,
    findAll: vi.fn().mockImplementation(async () => undefined)
  };

  const mockPlantsRepository = {
    queryPlants: vi.fn().mockResolvedValue([createPlant()])
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key];
        }),
        clear: vi.fn(() => {
          store = {};
        }),
      };
    })();
    vi.stubGlobal('localStorage', localStorageMock);

    currentRegionSignal.set(null);
    mockPlantsRepository.queryPlants.mockResolvedValue([createPlant()]);
    regionsSignal.set([
      createRegion(),
      createRegion({ id: 'r2', longitude: -46.7, latitude: -23.6, region: ' north ' }),
      createRegion({ id: 'r3', longitude: -46.8, latitude: -23.7, region: 'South' })
    ]);

    TestBed.configureTestingModule({
      providers: [
        FarmOverviewMapViewModel,
        { provide: PlantsRepository, useValue: mockPlantsRepository },
        { provide: RegionsRepository, useValue: mockRegionsRepository },
        { provide: PLATFORM_ID, useValue: 'browser' }
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
    expect(mockPlantsRepository.queryPlants).not.toHaveBeenCalled();
    expect(viewModel.isLoadingRegions()).toBe(false);
  });

  it('should change the region and reload plants', async () => {
    const southPlants = [createPlant({ id: 'south-1', region: 'South' })];
    mockPlantsRepository.queryPlants.mockResolvedValueOnce(southPlants);

    // Mark as initialized so effect triggers plant loading
    await viewModel.restoreMapContextAfterRegionsLoad();
    mockPlantsRepository.queryPlants.mockResolvedValueOnce(southPlants);

    viewModel.selectedRegionId.set('r3');
    TestBed.flushEffects();
    await vi.waitFor(() => expect(mockPlantsRepository.queryPlants).toHaveBeenLastCalledWith({
      region: 'South',
      occurrence: '',
      variety: ''
    }));

    expect(viewModel.selectedRegionId()).toBe('r3');
    expect(currentRegionSignal()?.id).toBe('r3');
  });

  it('should clear selection when the region is not found', async () => {
    await viewModel.restoreMapContextAfterRegionsLoad();

    viewModel.selectedRegionId.set('missing-region');
    TestBed.flushEffects();

    expect(currentRegionSignal()).toBeNull();
  });

  it('should apply the occurrence filter using the current region', async () => {
    viewModel.selectedRegionId.set('r1');
    await viewModel.restoreMapContextAfterRegionsLoad();
    mockPlantsRepository.queryPlants.mockClear();

    viewModel.selectedOccurrenceKey.set('mites');
    TestBed.flushEffects();

    expect(viewModel.selectedOccurrenceKey()).toBe('mites');
    await vi.waitFor(() => expect(mockPlantsRepository.queryPlants).toHaveBeenCalledWith({
      region: 'North',
      occurrence: 'mites',
      variety: ''
    }));
  });

  it('should apply the variety filter using the current region', async () => {
    viewModel.selectedRegionId.set('r1');
    await viewModel.restoreMapContextAfterRegionsLoad();
    mockPlantsRepository.queryPlants.mockClear();

    viewModel.selectedVariety.set('Gala');
    TestBed.flushEffects();

    expect(viewModel.selectedVariety()).toBe('Gala');
    await vi.waitFor(() => expect(mockPlantsRepository.queryPlants).toHaveBeenCalledWith({
      region: 'North',
      occurrence: '',
      variety: 'Gala'
    }));
  });

  it('should restore plants and current region after regions load when selection is persisted', async () => {
    viewModel.selectedRegionId.set('r1');
    mockPlantsRepository.queryPlants.mockResolvedValueOnce([createPlant({ id: 'p1' })]);

    await viewModel.restoreMapContextAfterRegionsLoad();

    expect(currentRegionSignal()?.id).toBe('r1');
    expect(mockPlantsRepository.queryPlants).toHaveBeenCalledWith({
      region: 'North',
      occurrence: '',
      variety: ''
    });
    expect(viewModel.plants().length).toBe(1);
  });

  it('should clear stale region id on restore when the region no longer exists', async () => {
    viewModel.selectedRegionId.set('unknown-id');

    await viewModel.restoreMapContextAfterRegionsLoad();

    expect(viewModel.selectedRegionId()).toBe('');
    expect(viewModel.plants()).toEqual([]);
  });

  describe('persistence', () => {
    it('should initialize with values from localStorage', () => {
      // Set storage BEFORE creating the test bed or injecting
      localStorage.setItem('farm_overview_map_region_id', 'r1');
      localStorage.setItem('farm_overview_map_occurrence_key', 'mites');
      localStorage.setItem('farm_overview_map_variety', 'Gala');

      // Create a fresh TestBed just for this test to ensure constructor is run with pre-filled storage
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          FarmOverviewMapViewModel,
          { provide: PlantsRepository, useValue: mockPlantsRepository },
          { provide: RegionsRepository, useValue: mockRegionsRepository },
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      });

      const newViewModel = TestBed.inject(FarmOverviewMapViewModel);

      expect(newViewModel.selectedRegionId()).toBe('r1');
      expect(newViewModel.selectedOccurrenceKey()).toBe('mites');
      expect(newViewModel.selectedVariety()).toBe('Gala');
    });

    it('should save region selection to localStorage', () => {
      viewModel.selectedRegionId.set('r3');
      TestBed.flushEffects();
      expect(localStorage.setItem).toHaveBeenCalledWith('farm_overview_map_region_id', 'r3');
    });

    it('should save occurrence selection to localStorage', () => {
      viewModel.selectedOccurrenceKey.set('mites');
      TestBed.flushEffects();
      expect(localStorage.setItem).toHaveBeenCalledWith('farm_overview_map_occurrence_key', 'mites');
    });

    it('should save variety selection to localStorage', () => {
      viewModel.selectedVariety.set('Gala');
      TestBed.flushEffects();
      expect(localStorage.setItem).toHaveBeenCalledWith('farm_overview_map_variety', 'Gala');
    });

    it('should remove from localStorage when value is cleared', () => {
      viewModel.selectedRegionId.set('');
      TestBed.flushEffects();
      expect(localStorage.removeItem).toHaveBeenCalledWith('farm_overview_map_region_id');
    });
  });
});

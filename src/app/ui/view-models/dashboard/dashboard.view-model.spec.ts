import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeDashboardRepository } from '../../../data/repositories/home-dashboard/home-dashboard-repository';
import { LoadingService } from '../../../shared/services/loading.service';
import { DashboardViewModel } from './dashboard.view-model';

describe('DashboardViewModel', () => {
  let viewModel: DashboardViewModel;
  let loadingService: LoadingService;

  const getHomeDashboardData = vi.fn();
  const getFilterOptions = vi.fn();
  const getOpenOccurrences = vi.fn();
  const getZoneRegions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    getHomeDashboardData.mockResolvedValue({
      summary: {
        totalPlants: 12,
        totalZones: 3,
        totalOccurrenceTypes: 7,
        totalVarieties: 2,
        varieties: [
          { id: 1, name: 'Gala' },
          { id: 2, name: 'Fuji' },
        ],
      },
      plants: [
        { id: 'p1', latitude: -21.1, longitude: -47.1, varietyId: 1, varietyName: 'Gala' },
        { id: 'p2', latitude: -21.2, longitude: -47.2, varietyId: null, varietyName: null },
      ],
      farmBoundary: [
        { id: 'f3', latitude: -21.3, longitude: -47.3, order: 3 },
        { id: 'f1', latitude: -21.1, longitude: -47.1, order: 1 },
        { id: 'f2', latitude: -21.2, longitude: -47.2, order: 2 },
      ],
    });

    getFilterOptions.mockResolvedValue({
      zones: [
        { id: 'z1', name: 'Zona A', polygon: null },
        { id: 'z2', name: 'Zona B', polygon: null },
      ],
      occurrences: [
        { id: 'o1', name: 'Broca' },
        { id: 'o2', name: 'Formigueiro' },
      ],
    });

    getOpenOccurrences.mockResolvedValue([
      { plant_id: 'p1', occurrence_type_id: 'o1' }
    ]);

    getZoneRegions.mockResolvedValue([
      {
        id: 'r3',
        created_at: '2026-01-01T00:00:00Z',
        latitude: -21.3,
        longitude: -47.3,
        region: 'A',
        zone_id: 'z1',
        order: 3,
      },
      {
        id: 'r1',
        created_at: '2026-01-01T00:00:00Z',
        latitude: -21.0,
        longitude: -47.0,
        region: 'A',
        zone_id: 'z1',
        order: 1,
      },
      {
        id: 'r2',
        created_at: '2026-01-01T00:00:00Z',
        latitude: -21.0,
        longitude: -47.5,
        region: 'A',
        zone_id: 'z1',
        order: 2,
      },
    ]);

    TestBed.configureTestingModule({
      providers: [
        DashboardViewModel,
        {
          provide: HomeDashboardRepository,
          useValue: {
            getHomeDashboardData,
            getFilterOptions,
            getOpenOccurrences,
            getZoneRegions,
          },
        },
      ],
    });

    viewModel = TestBed.inject(DashboardViewModel);
    loadingService = TestBed.inject(LoadingService);
  });

  it('should load dashboard snapshot, filter options and open occurrences on initialization', async () => {
    await viewModel.loadDashboard();

    expect(getHomeDashboardData).toHaveBeenLastCalledWith(
      {
        plantingStartDate: null,
        plantingEndDate: null,
      },
      expect.any(Function),
    );
    expect(getFilterOptions).toHaveBeenCalled();
    expect(getOpenOccurrences).toHaveBeenCalled();
    expect(viewModel.plottedPlantsCount()).toBe(2);
    expect(viewModel.availableZones().length).toBe(2);
    expect(viewModel.availableOccurrences().length).toBe(2);
    expect(viewModel.openOccurrences().length).toBe(1);
    expect(viewModel.farmBoundary()?.points.map((point) => point.id)).toEqual([
      'f1',
      'f2',
      'f3',
    ]);
  });

  it('should not show loading when the snapshot comes from cache', async () => {
    await viewModel.loadDashboard();

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.message()).toBeUndefined();
  });

  it('should show loading only while an HTTP-backed snapshot is pending', async () => {
    const snapshot = await getHomeDashboardData();
    getHomeDashboardData.mockImplementationOnce(
      async (
        _filters: unknown,
        onCacheMiss?: () => void,
      ) => {
        onCacheMiss?.();
        expect(loadingService.isLoading()).toBe(true);
        expect(loadingService.message()).toBe('Carregando dados...');
        return snapshot;
      },
    );

    await viewModel.loadDashboard();

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.message()).toBeUndefined();
  });

  it('should expose available varieties from summary', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.availableVarieties()).toEqual([
      { id: 1, name: 'Gala' },
      { id: 2, name: 'Fuji' },
    ]);
  });

  it('should filter plants by variety when filterVarietyId is set', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.filteredPlants().length).toBe(2);

    viewModel.filterVarietyId.set('1');
    expect(viewModel.filteredPlants().length).toBe(1);
    expect(viewModel.filteredPlants()[0].id).toBe('p1');
  });

  it('should filter plants by occurrence when filterOccurrenceId is set', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.filteredPlants().length).toBe(2);

    viewModel.filterOccurrenceId.set('o1');
    expect(viewModel.filteredPlants().length).toBe(1);
    expect(viewModel.filteredPlants()[0].id).toBe('p1');
  });

  it('should load selected zone boundary by collected point order', async () => {
    await viewModel.loadDashboard();

    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    expect(getZoneRegions).toHaveBeenCalledWith('z1');
    expect(viewModel.selectedZoneBoundary()?.points.map((point) => point.id)).toEqual([
      'r1',
      'r2',
      'r3',
    ]);
  });

  it('should filter plants using the ordered selected zone polygon', async () => {
    await viewModel.loadDashboard();
    await waitForAsyncEffects();
    viewModel.mapPlants.set([
      { id: 'inside', latitude: -21.1, longitude: -47.2, varietyId: null, varietyName: null },
      { id: 'outside', latitude: -22.5, longitude: -48.5, varietyId: null, varietyName: null },
    ]);
    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    expect(viewModel.filteredPlants().map((plant) => plant.id)).toEqual([
      'inside',
    ]);
  });

  it('should not filter by zone when the selected zone cannot form a polygon', async () => {
    getZoneRegions.mockResolvedValueOnce([
      {
        id: 'r1',
        created_at: '2026-01-01T00:00:00Z',
        latitude: -21.0,
        longitude: -47.0,
        region: 'A',
        zone_id: 'z1',
        order: 1,
      },
      {
        id: 'r2',
        created_at: '2026-01-01T00:00:00Z',
        latitude: -21.0,
        longitude: -47.5,
        region: 'A',
        zone_id: 'z1',
        order: 2,
      },
    ]);
    await viewModel.loadDashboard();

    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    expect(viewModel.selectedZoneBoundary()).toBeNull();
    expect(viewModel.filteredPlants().length).toBe(2);
  });

  it('should keep dashboard plants available when selected zone boundary loading fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getZoneRegions.mockRejectedValueOnce(new Error('failed'));
    await viewModel.loadDashboard();

    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    expect(viewModel.selectedZoneBoundary()).toBeNull();
    expect(viewModel.filteredPlants().length).toBe(2);
    consoleError.mockRestore();
  });

  it('should build variety legend with fallback for plants without variety', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.varietyLegend()).toEqual([
      { label: 'Gala', color: '#0f766e', varietyId: 1 },
      { label: 'Fuji', color: '#1d4ed8', varietyId: 2 },
      { label: 'Sem variedade', color: '#16a34a', varietyId: null },
    ]);
    expect(viewModel.getVarietyColor(1, 'Coracao')).toBe('#0f766e');
    expect(viewModel.getVarietyColor(null, null)).toBe('#16a34a');
  });

  it('should use normalized variety name when id is not available', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.getVarietyColor(null, ' gala ')).toBe('#0f766e');
  });

  it('should use pink for classica varieties', async () => {
    getHomeDashboardData.mockResolvedValueOnce({
      summary: {
        totalPlants: 12,
        totalZones: 3,
        totalOccurrenceTypes: 7,
        totalVarieties: 1,
        varieties: [{ id: 9, name: 'Classica' }],
      },
      plants: [
        { id: 'p9', latitude: -21.1, longitude: -47.1, varietyId: 9, varietyName: 'Classica' },
      ],
    });

    await viewModel.loadDashboard();

    expect(viewModel.varietyLegend()).toEqual([
      { label: 'Classica', color: '#ec4899', varietyId: 9 },
    ]);
    expect(viewModel.getVarietyColor(9, 'Classica')).toBe('#ec4899');
  });

  it('should start with empty planting date filters', () => {
    expect(viewModel.filterPlantingStartDate()).toBe('');
    expect(viewModel.filterPlantingEndDate()).toBe('');

    expect(viewModel.snapshotFilters()).toEqual({
      plantingStartDate: null,
      plantingEndDate: null,
    });
  });

  it('should expose planting date filters for the snapshot request', () => {
    viewModel.filterPlantingStartDate.set('2026-01-01');
    viewModel.filterPlantingEndDate.set('2026-02-01');

    expect(viewModel.snapshotFilters()).toEqual({
      plantingStartDate: '2026-01-01',
      plantingEndDate: '2026-02-01',
    });
  });
});

async function waitForAsyncEffects(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

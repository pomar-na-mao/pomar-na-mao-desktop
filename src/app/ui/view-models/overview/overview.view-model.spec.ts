import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OverviewRepository } from '../../../data/repositories/overview/overview-repository';
import { LoadingService } from '../../../shared/services/loading.service';
import { OverviewViewModel } from './overview.view-model';

describe('OverviewViewModel', () => {
  let viewModel: OverviewViewModel;
  let loadingService: LoadingService;

  const getOverviewData = vi.fn();
  const getFilterOptions = vi.fn();
  const getOpenOccurrences = vi.fn();
  const getZoneRegions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    getOverviewData.mockResolvedValue({
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
        { id: 'p1', latitude: -21.1, longitude: -47.1, varietyId: 1, varietyName: 'Gala', isDead: false, nonExistent: false },
        { id: 'p2', latitude: -21.2, longitude: -47.2, varietyId: null, varietyName: null, isDead: false, nonExistent: false },
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
        OverviewViewModel,
        {
          provide: OverviewRepository,
          useValue: {
            getOverviewData,
            getFilterOptions,
            getOpenOccurrences,
            getZoneRegions,
          },
        },
      ],
    });

    viewModel = TestBed.inject(OverviewViewModel);
    loadingService = TestBed.inject(LoadingService);
  });

  it('should load overview snapshot, filter options and open occurrences on initialization', async () => {
    await viewModel.loadOverview();

    expect(getOverviewData).toHaveBeenLastCalledWith(
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
    await viewModel.loadOverview();

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.message()).toBeUndefined();
  });

  it('should show loading only while an HTTP-backed snapshot is pending', async () => {
    const snapshot = await getOverviewData();
    getOverviewData.mockImplementationOnce(
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

    await viewModel.loadOverview();

    expect(loadingService.isLoading()).toBe(false);
    expect(loadingService.message()).toBeUndefined();
  });

  it('should expose available varieties from summary', async () => {
    await viewModel.loadOverview();

    expect(viewModel.availableVarieties()).toEqual([
      { id: 1, name: 'Gala' },
      { id: 2, name: 'Fuji' },
    ]);
  });

  it('should filter plants by variety when filterVarietyId is set', async () => {
    await viewModel.loadOverview();

    expect(viewModel.filteredPlants().length).toBe(2);

    viewModel.filterVarietyId.set('1');
    expect(viewModel.filteredPlants().length).toBe(1);
    expect(viewModel.filteredPlants()[0].id).toBe('p1');

    viewModel.filterVarietyId.set('none');
    expect(viewModel.filteredPlants().length).toBe(1);
    expect(viewModel.filteredPlants()[0].id).toBe('p2');
  });

  it('should filter plants by plant status when filterPlantStatus is set', async () => {
    getOverviewData.mockResolvedValueOnce({
      summary: null,
      plants: [
        { id: 'p-alive', latitude: -21.1, longitude: -47.1, varietyId: 1, varietyName: 'Gala', isDead: false, nonExistent: false },
        { id: 'p-dead', latitude: -21.2, longitude: -47.2, varietyId: null, varietyName: null, isDead: true, nonExistent: false },
      ],
      farmBoundary: [],
    });

    await viewModel.loadOverview();
    expect(viewModel.filteredPlants().length).toBe(2);

    viewModel.filterPlantStatus.set('alive');
    expect(viewModel.filteredPlants().map((p) => p.id)).toEqual(['p-alive']);

    viewModel.filterPlantStatus.set('dead');
    expect(viewModel.filteredPlants().map((p) => p.id)).toEqual(['p-dead']);

    viewModel.filterPlantStatus.set('');
    expect(viewModel.filteredPlants().length).toBe(2);
  });

  it('should not include empty spots (nonExistent) when filtering by Sem variedade or by specific variety', async () => {
    getOverviewData.mockResolvedValueOnce({
      summary: null,
      plants: [
        { id: 'p-alive-gala', latitude: -21.1, longitude: -47.1, varietyId: 1, varietyName: 'Gala', isDead: false, nonExistent: false },
        { id: 'p-empty-no-variety', latitude: -21.2, longitude: -47.2, varietyId: null, varietyName: null, isDead: false, nonExistent: true },
      ],
      farmBoundary: [],
    });

    await viewModel.loadOverview();
    expect(viewModel.filteredPlants().length).toBe(2);

    // When filtering by 'none' (Sem variedade), empty spots must NOT be shown
    viewModel.filterVarietyId.set('none');
    expect(viewModel.filteredPlants().length).toBe(0);

    // When filtering by variety 1, only living Gala plant is shown
    viewModel.filterVarietyId.set('1');
    expect(viewModel.filteredPlants().map((p) => p.id)).toEqual(['p-alive-gala']);
  });

  it('should filter plants by occurrence when filterOccurrenceId is set', async () => {
    await viewModel.loadOverview();

    expect(viewModel.filteredPlants().length).toBe(2);

    viewModel.filterOccurrenceId.set('o1');
    expect(viewModel.filteredPlants().length).toBe(1);
    expect(viewModel.filteredPlants()[0].id).toBe('p1');
  });

  it('should load selected zone boundary by collected point order', async () => {
    await viewModel.loadOverview();

    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    expect(getZoneRegions).toHaveBeenCalledWith('z1');
    expect(viewModel.selectedZoneBoundary()?.points.map((point) => point.id)).toEqual([
      'r1',
      'r2',
      'r3',
    ]);
  });

  it('should fit the map to the selected zone without extending to the farm boundary', async () => {
    await viewModel.loadOverview();

    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    const fitBounds = vi.fn();
    viewModel['map'] = { fitBounds } as never;

    expect(viewModel['fitSelectedZoneBounds']()).toBe(true);
    expect(fitBounds).toHaveBeenCalledOnce();

    const fittedBounds = fitBounds.mock.calls[0][0];
    expect(fittedBounds.getSouthWest().lat).toBeCloseTo(-21.3);
    expect(fittedBounds.getSouthWest().lng).toBeCloseTo(-47.5);
    expect(fittedBounds.getNorthEast().lat).toBeCloseTo(-21.0);
    expect(fittedBounds.getNorthEast().lng).toBeCloseTo(-47.0);
  });

  it('should filter plants using the ordered selected zone polygon', async () => {
    await viewModel.loadOverview();
    await waitForAsyncEffects();
    viewModel.mapPlants.set([
      { id: 'inside', latitude: -21.1, longitude: -47.2, varietyId: null, varietyName: null, isDead: false, nonExistent: false },
      { id: 'outside', latitude: -22.5, longitude: -48.5, varietyId: null, varietyName: null, isDead: false, nonExistent: false },
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
    await viewModel.loadOverview();

    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    expect(viewModel.selectedZoneBoundary()).toBeNull();
    expect(viewModel.filteredPlants().length).toBe(2);
  });

  it('should keep overview plants available when selected zone boundary loading fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getZoneRegions.mockRejectedValueOnce(new Error('failed'));
    await viewModel.loadOverview();

    viewModel.filterZoneId.set('z1');
    await waitForAsyncEffects();

    expect(viewModel.selectedZoneBoundary()).toBeNull();
    expect(viewModel.filteredPlants().length).toBe(2);
    consoleError.mockRestore();
  });

  it('should use green for living plants and red for dead plants', async () => {
    await viewModel.loadOverview();

    expect(viewModel.getPlantStatusPresentation(viewModel.mapPlants()[0])).toEqual({
      label: 'Viva',
      color: '#10b981',
      strokeColor: '#047857',
    });
    expect(
      viewModel.getPlantStatusPresentation({
        ...viewModel.mapPlants()[0],
        isDead: true,
      }),
    ).toEqual({
      label: 'Morta',
      color: '#ef4444',
      strokeColor: '#b91c1c',
    });
  });

  it('should include nonExistent plants in mapPlants and filteredPlants', async () => {
    getOverviewData.mockResolvedValueOnce({
      summary: {
        totalPlants: 3,
        totalZones: 0,
        totalOccurrenceTypes: 0,
        totalVarieties: 1,
        varieties: [{ id: 1, name: 'Gala' }],
      },
      plants: [
        { id: 'p1', latitude: -21.1, longitude: -47.1, varietyId: 1, varietyName: 'Gala', isDead: false, nonExistent: false },
        { id: 'p-empty', latitude: -21.2, longitude: -47.2, varietyId: null, varietyName: null, isDead: true, nonExistent: true },
      ],
      farmBoundary: [],
    });

    await viewModel.loadOverview();

    expect(viewModel.mapPlants().length).toBe(2);
    expect(viewModel.filteredPlants().find((p) => p.id === 'p-empty')?.nonExistent).toBe(true);
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

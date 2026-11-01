import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZoneAssignmentViewModel } from './zone-assignment.view-model';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { ZoneAssignmentRepository } from '../../../data/repositories/zone-assignment/zone-assignment.repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { LoadingService } from '../../../shared/services/loading.service';
import { MessageService } from '../../../data/services/message/message.service';
import type { Zone } from '../../../domain/models/zone.model';
import type {
  ZoneAssignmentPlant,
  ZoneAssignmentPreviewPlant,
} from '../../../domain/models/zone-assignment.model';

function createZone(overrides: Partial<Zone> = {}): Zone {
  return {
    id: 'z1',
    name: 'Zona A',
    code: 'A',
    description: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    local_id: null,
    device_id: null,
    sync_status: 'synced',
    synced_at: null,
    ...overrides,
  };
}

describe('ZoneAssignmentViewModel', () => {
  let viewModel: ZoneAssignmentViewModel;
  let zonesSignal: ReturnType<typeof signal<Zone[]>>;
  let allPlantsSignal: ReturnType<typeof signal<ZoneAssignmentPlant[]>>;
  let previewPlantsSignal: ReturnType<typeof signal<ZoneAssignmentPreviewPlant[]>>;
  let polygonCoordsSignal: ReturnType<typeof signal<{ lat: number; lng: number }[]>>;

  let mockZonesRepository: {
    zones: typeof zonesSignal;
    findAll: ReturnType<typeof vi.fn>;
  };

  let mockRegionsRepository: {
    findByZoneId: ReturnType<typeof vi.fn>;
  };

  let mockZoneAssignmentRepository: {
    allPlants: typeof allPlantsSignal;
    previewPlants: typeof previewPlantsSignal;
    selectedPolygonCoordinates: typeof polygonCoordsSignal;
    selectedPlants: ReturnType<typeof signal<ZoneAssignmentPreviewPlant[]>>;
    plantsFoundCount: ReturnType<typeof signal<number>>;
    selectedPlantsCount: ReturnType<typeof signal<number>>;
    loadAllPlants: ReturnType<typeof vi.fn>;
    previewPlantsInsidePolygon: ReturnType<typeof vi.fn>;
    savePolygonCoordinates: ReturnType<typeof vi.fn>;
    clearPolygonCoordinates: ReturnType<typeof vi.fn>;
    clearPreviewPlants: ReturnType<typeof vi.fn>;
    setPlantSelected: ReturnType<typeof vi.fn>;
    toggleAllPlants: ReturnType<typeof vi.fn>;
    assignPlantsToZone: ReturnType<typeof vi.fn>;
  };

  let mockMessageService: {
    error: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
  };

  let mockLoadingService: {
    show: ReturnType<typeof vi.fn>;
    hide: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    zonesSignal = signal<Zone[]>([createZone()]);
    allPlantsSignal = signal<ZoneAssignmentPlant[]>([
      { id: 'p1', latitude: -23.4, longitude: -49.1, zoneId: null },
    ]);
    previewPlantsSignal = signal<ZoneAssignmentPreviewPlant[]>([]);
    polygonCoordsSignal = signal<{ lat: number; lng: number }[]>([]);

    const selectedPlantsComputed = signal<ZoneAssignmentPreviewPlant[]>([]);
    const plantsFoundCountComputed = signal<number>(0);
    const selectedPlantsCountComputed = signal<number>(0);

    mockZonesRepository = {
      zones: zonesSignal,
      findAll: vi.fn().mockResolvedValue({ error: null }),
    };

    mockRegionsRepository = {
      findByZoneId: vi.fn().mockResolvedValue({
        data: [
          { id: 'r1', latitude: -23.1, longitude: -49.1, region: 'A', zone_id: 'z1', order: 1 },
          { id: 'r2', latitude: -23.2, longitude: -49.2, region: 'A', zone_id: 'z1', order: 2 },
          { id: 'r3', latitude: -23.3, longitude: -49.3, region: 'A', zone_id: 'z1', order: 3 },
        ],
        error: null,
      }),
    };

    mockZoneAssignmentRepository = {
      allPlants: allPlantsSignal,
      previewPlants: previewPlantsSignal,
      selectedPolygonCoordinates: polygonCoordsSignal,
      selectedPlants: selectedPlantsComputed,
      plantsFoundCount: plantsFoundCountComputed,
      selectedPlantsCount: selectedPlantsCountComputed,
      loadAllPlants: vi.fn().mockResolvedValue({ data: [], error: null }),
      previewPlantsInsidePolygon: vi.fn().mockResolvedValue({ data: [], error: null }),
      savePolygonCoordinates: vi.fn(),
      clearPolygonCoordinates: vi.fn(),
      clearPreviewPlants: vi.fn(),
      setPlantSelected: vi.fn(),
      toggleAllPlants: vi.fn(),
      assignPlantsToZone: vi.fn().mockResolvedValue({
        data: { zoneId: 'z1', zoneName: 'Zona A', plantsUpdatedCount: 1 },
        error: null,
      }),
    };

    mockMessageService = {
      error: vi.fn(),
      success: vi.fn(),
      warn: vi.fn(),
    };

    mockLoadingService = {
      show: vi.fn(),
      hide: vi.fn(),
    };

    const mockFarmBoundaryService = {
      getBoundary: vi.fn().mockResolvedValue([
        { latitude: 1, longitude: 2, order: 2 },
        { latitude: 3, longitude: 4, order: 1 },
        { latitude: 5, longitude: 6, order: 3 },
      ]),
    };

    TestBed.configureTestingModule({
      providers: [
        ZoneAssignmentViewModel,
        { provide: ZonesRepository, useValue: mockZonesRepository },
        { provide: RegionsRepository, useValue: mockRegionsRepository },
        { provide: ZoneAssignmentRepository, useValue: mockZoneAssignmentRepository },
        { provide: FarmBoundaryService, useValue: mockFarmBoundaryService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: LoadingService, useValue: mockLoadingService },
      ],
    });

    viewModel = TestBed.inject(ZoneAssignmentViewModel);
  });

  it('initializes with default values and builds zone options', () => {
    expect(viewModel.selectedZoneId()).toBe('');
    expect(viewModel.zoneOptions().length).toBe(2); // placeholder + 1 zone
    expect(viewModel.zoneOptions()[1].label).toContain('Zona A');
  });

  it('loads initial data correctly', async () => {
    await viewModel.loadInitialData();
    expect(mockZonesRepository.findAll).toHaveBeenCalled();
    expect(mockZoneAssignmentRepository.loadAllPlants).toHaveBeenCalled();
    expect(viewModel.farmInitialCenter()).toEqual([3, 4]);
    expect(viewModel.farmInitialZoom()).toBe(16);
    expect(viewModel.farmPolygonCoords()).toEqual([
      [3, 4],
      [1, 2],
      [5, 6],
    ]);
    expect(viewModel.mapBackgroundPolygons()).toEqual([
      [
        [3, 4],
        [1, 2],
        [5, 6],
      ],
    ]);
    expect(viewModel.mapBackgroundPolygonColors()).toEqual(['#0f3b8f']);
    expect(viewModel.mapBackgroundPolygonFillOpacities()).toEqual([0]);
  });

  it('loads zone points when a zone is selected and plots both farm and zone polygons', async () => {
    await viewModel.loadInitialData();
    await viewModel.onZoneChange('z1');
    expect(mockRegionsRepository.findByZoneId).toHaveBeenCalledWith('z1');
    expect(viewModel.selectedZonePoints().length).toBe(3);
    expect(viewModel.selectedZonePolygon()).toEqual([
      [-23.1, -49.1],
      [-23.2, -49.2],
      [-23.3, -49.3],
    ]);
    expect(viewModel.mapBackgroundPolygons()).toEqual([
      [
        [3, 4],
        [1, 2],
        [5, 6],
      ],
      [
        [-23.1, -49.1],
        [-23.2, -49.2],
        [-23.3, -49.3],
      ],
    ]);
    expect(viewModel.mapBackgroundPolygonColors()).toEqual(['#0f3b8f', '#f97316']);
    expect(viewModel.mapBackgroundPolygonLabels()).toEqual(['', 'Zona A']);
    expect(viewModel.mapBackgroundPolygonDashArrays()).toEqual([null, '6, 6']);
    expect(viewModel.mapBackgroundPolygonFillOpacities()).toEqual([0, 0.24]);
  });

  it('triggers useZonePolygonAsSelection when zone points are available', async () => {
    await viewModel.onZoneChange('z1');
    viewModel.useZonePolygonAsSelection();
    expect(viewModel.applyZonePolygonSignal()).toEqual([
      [-23.1, -49.1],
      [-23.2, -49.2],
      [-23.3, -49.3],
    ]);
  });

  it('handles onPolygonSelected and triggers preview', async () => {
    polygonCoordsSignal.set([
      { lat: -23.1, lng: -49.1 },
      { lat: -23.2, lng: -49.2 },
      { lat: -23.3, lng: -49.3 },
    ]);

    mockZoneAssignmentRepository.previewPlantsInsidePolygon.mockResolvedValue({
      data: [
        {
          plantId: 'p1',
          latitude: -23.2,
          longitude: -49.2,
          zoneId: null,
          zoneName: null,
          varietyId: 1,
          varietyName: 'Hass',
          plantingDate: null,
          selected: true,
        },
      ],
      error: null,
    });

    await viewModel.onPreviewPlants();
    expect(mockZoneAssignmentRepository.previewPlantsInsidePolygon).toHaveBeenCalled();
    expect(viewModel.previewLoaded()).toBe(true);
  });

  it('saves zone assignment and shows success message', async () => {
    viewModel.selectedZoneId.set('z1');
    mockZoneAssignmentRepository.selectedPlants.set([
      {
        plantId: 'p1',
        latitude: -23.2,
        longitude: -49.2,
        zoneId: null,
        zoneName: null,
        varietyId: 1,
        varietyName: 'Hass',
        plantingDate: null,
        selected: true,
      },
    ]);

    await viewModel.save();

    expect(mockLoadingService.show).toHaveBeenCalled();
    expect(mockZoneAssignmentRepository.assignPlantsToZone).toHaveBeenCalledWith({
      zoneId: 'z1',
      plantIds: ['p1'],
    });
    expect(mockMessageService.success).toHaveBeenCalledWith(
      expect.stringContaining('1 plantas foram atribuídas à Zona A!'),
    );
    expect(mockLoadingService.hide).toHaveBeenCalled();
  });
});

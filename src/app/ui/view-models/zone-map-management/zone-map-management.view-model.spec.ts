import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { MessageService } from '../../../data/services/message/message.service';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import type { Region } from '../../../domain/models/regions.model';
import type { Zone } from '../../../domain/models/zone.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { ZoneMapManagementViewModel } from './zone-map-management.view-model';

function createZone(overrides: Partial<Zone> = {}): Zone {
  return {
    id: 'zone-1',
    name: 'Zona A',
    code: null,
    description: null,
    polygon: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    local_id: null,
    device_id: null,
    sync_status: 'synced',
    synced_at: null,
    ...overrides,
  };
}

describe('ZoneMapManagementViewModel', () => {
  let viewModel: ZoneMapManagementViewModel;
  const zonesSignal = signal<Zone[]>([]);

  const mockZonesRepository = {
    zones: zonesSignal,
    findAll: vi.fn(),
    createWithRegions: vi.fn(),
  };

  const regionsSignal = signal<Region[]>([]);

  const mockRegionsRepository = {
    regions: regionsSignal,
    findAll: vi.fn(),
  };

  const mockMessageService = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };

  const mockLoadingService = {
    show: vi.fn(),
    hide: vi.fn(),
  };

  const mockFarmBoundaryService = {
    getBoundary: vi.fn().mockResolvedValue([]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    zonesSignal.set([createZone()]);
    regionsSignal.set([]);
    mockZonesRepository.findAll.mockResolvedValue({ error: null });
    mockRegionsRepository.findAll.mockResolvedValue({ error: null });
    mockFarmBoundaryService.getBoundary.mockResolvedValue([]);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        ZoneMapManagementViewModel,
        { provide: ZonesRepository, useValue: mockZonesRepository },
        { provide: RegionsRepository, useValue: mockRegionsRepository },
        { provide: MessageService, useValue: mockMessageService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: FarmBoundaryService, useValue: mockFarmBoundaryService },
      ],
    });

    viewModel = TestBed.inject(ZoneMapManagementViewModel);
  });

  it('should keep the farm polygon plotted before zone polygons', async () => {
    mockFarmBoundaryService.getBoundary.mockResolvedValue([
      { latitude: 1, longitude: 2, order: 2 },
      { latitude: 3, longitude: 4, order: 1 },
      { latitude: 5, longitude: 6, order: 3 },
    ]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        ZoneMapManagementViewModel,
        { provide: ZonesRepository, useValue: mockZonesRepository },
        { provide: RegionsRepository, useValue: mockRegionsRepository },
        { provide: MessageService, useValue: mockMessageService },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: FarmBoundaryService, useValue: mockFarmBoundaryService },
      ],
    });

    viewModel = TestBed.inject(ZoneMapManagementViewModel);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(viewModel.mapBackgroundPolygons()[0]).toEqual([[3, 4], [1, 2], [5, 6]]);
    expect(viewModel.mapBackgroundPolygonLabels()[0]).toBe('');
    expect(viewModel.mapBackgroundPolygonColors()[0]).toBe('#0f3b8f');
    expect(viewModel.mapBackgroundPolygonDashArrays()[0]).toBeNull();
    expect(viewModel.mapBackgroundPolygonFillOpacities()[0]).toBe(0);
  });

  it('should load zones and regions on startup', async () => {
    await viewModel.loadInitialData();

    expect(mockZonesRepository.findAll).toHaveBeenCalled();
    expect(mockRegionsRepository.findAll).toHaveBeenCalled();
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.zonesLoadFailed()).toBe(false);
  });

  it('should block required, duplicate, and incomplete polygon submissions', async () => {
    await viewModel.save();

    expect(viewModel.nameError()).toBe('Informe o nome da zona.');
    expect(viewModel.codeError()).toBe('Informe o codigo da zona.');
    expect(mockZonesRepository.createWithRegions).not.toHaveBeenCalled();

    viewModel.zoneForm.controls.name.setValue(' zona a ');
    viewModel.zoneForm.controls.name.markAsDirty();
    viewModel.formVersion.update((value) => value + 1);

    expect(viewModel.nameError()).toBe('Ja existe uma zona com este nome.');

    viewModel.zoneForm.controls.code.setValue('ZA');
    zonesSignal.set([createZone({ code: 'ZA' })]);
    viewModel.formVersion.update((value) => value + 1);

    expect(viewModel.nameError()).toBeNull();

    viewModel.zoneForm.controls.name.setValue('Zona B');
    viewModel.zoneForm.controls.code.setValue('Zona B');
    viewModel.formVersion.update((value) => value + 1);

    expect(viewModel.polygonError()).toBe(
      'Desenhe um polígono com pelo menos 3 pontos.',
    );
    expect(viewModel.canSave()).toBe(false);
  });

  it('should build the RPC payload, refresh data, and reset on success', async () => {
    viewModel.zoneForm.setValue({
      name: 'Zona B',
      code: 'ZB',
      description: 'Nova area',
    });
    viewModel.onPolygonSelected([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ]);
    mockZonesRepository.createWithRegions.mockResolvedValue({
      data: {
        zone_id: 'zone-2',
        zone_name: 'Zona B',
        region_points_count: 3,
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [2, 1],
              [4, 3],
              [6, 5],
              [2, 1],
            ],
          ],
        },
      },
      error: null,
      message: null,
    });

    await viewModel.save();

    expect(mockZonesRepository.createWithRegions).toHaveBeenCalledWith({
      name: 'Zona B',
      code: 'ZB',
      description: 'Nova area',
      polygonGeojson: {
        type: 'Polygon',
        coordinates: [
          [
            [2, 1],
            [4, 3],
            [6, 5],
            [2, 1],
          ],
        ],
      },
      points: [
        { latitude: 1, longitude: 2, order: 1 },
        { latitude: 3, longitude: 4, order: 2 },
        { latitude: 5, longitude: 6, order: 3 },
      ],
    });
    expect(mockZonesRepository.findAll).toHaveBeenCalledTimes(1);
    expect(mockRegionsRepository.findAll).toHaveBeenCalledTimes(1);
    expect(viewModel.selectedPolygonCoordinates()).toEqual([]);
    expect(viewModel.savedZoneFocusPolygon()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    expect(viewModel.zoneForm.controls.name.value).toBe('');
    expect(viewModel.zoneForm.controls.code.value).toBe('');
    expect(mockLoadingService.show).toHaveBeenCalledWith('Salvando zona...');
    expect(mockLoadingService.hide).toHaveBeenCalled();
    expect(mockMessageService.success).toHaveBeenCalledWith(
      'Zona criada com sucesso',
    );
  });

  it('should preserve form and polygon state on save failure', async () => {
    viewModel.zoneForm.setValue({
      name: 'Zona B',
      code: 'ZB',
      description: '',
    });
    viewModel.onPolygonSelected([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ]);
    mockZonesRepository.createWithRegions.mockResolvedValue({
      data: null,
      error: { message: 'failed' },
      message: 'Erro ao salvar a zona no Supabase.',
    });

    await viewModel.save();

    expect(viewModel.saveError()).toBe('Erro ao salvar a zona no Supabase.');
    expect(viewModel.zoneForm.controls.name.value).toBe('Zona B');
    expect(viewModel.zoneForm.controls.code.value).toBe('ZB');
    expect(viewModel.selectedPolygonCoordinates()).toHaveLength(3);
    expect(mockLoadingService.show).toHaveBeenCalledWith('Salvando zona...');
    expect(mockLoadingService.hide).toHaveBeenCalled();
  });

  it('should expose existing zone polygons ordered by region point order', () => {
    zonesSignal.set([
      createZone({
        id: 'zone-1',
        name: 'Zona A',
        code: 'ZA',
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [200, 100],
              [400, 300],
              [600, 500],
              [200, 100],
            ],
          ],
        },
      }),
    ]);
    regionsSignal.set([
      {
        id: 'r2',
        created_at: '2026-01-01T00:00:00Z',
        longitude: 4,
        latitude: 3,
        region: 'ZA',
        zone_id: 'zone-1',
        order: 2,
      },
      {
        id: 'r1',
        created_at: '2026-01-01T00:00:00Z',
        longitude: 2,
        latitude: 1,
        region: 'ZA',
        zone_id: 'zone-1',
        order: 1,
      },
      {
        id: 'r3',
        created_at: '2026-01-01T00:00:00Z',
        longitude: 6,
        latitude: 5,
        region: 'ZA',
        zone_id: 'zone-1',
        order: 3,
      },
    ]);

    expect(viewModel.existingZonePolygons()).toEqual([
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    ]);
    expect(viewModel.existingZonePolygonLabels()).toEqual(['Zona A']);
    expect(viewModel.existingZonePolygonColors()[0]).toBe('#0ea5e9');
    expect(viewModel.existingZonePolygonDashArrays()).toEqual([null]);
  });

  it('should ignore region polygons without valid order values', () => {
    zonesSignal.set([
      createZone({
        id: 'zone-1',
        name: 'Zona A',
        code: 'ZA',
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [2, 1],
              [4, 3],
              [6, 5],
              [2, 1],
            ],
          ],
        },
      }),
    ]);
    regionsSignal.set([
      {
        id: 'r1',
        created_at: '2026-01-01T00:00:00Z',
        longitude: 20,
        latitude: 10,
        region: 'ZA',
        zone_id: 'zone-1',
        order: null,
      },
      {
        id: 'r2',
        created_at: '2026-01-01T00:00:00Z',
        longitude: 40,
        latitude: 30,
        region: 'ZA',
        zone_id: 'zone-1',
        order: null,
      },
      {
        id: 'r3',
        created_at: '2026-01-01T00:00:00Z',
        longitude: 60,
        latitude: 50,
        region: 'ZA',
        zone_id: 'zone-1',
        order: null,
      },
    ]);

    expect(viewModel.existingZonePolygons()).toEqual([
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
    ]);
  });
  it('should fall back to zone polygon when ordered regions are unavailable', () => {
    zonesSignal.set([
      createZone({
        id: 'zone-1',
        name: 'Zona A',
        code: 'ZA',
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [2, 1],
              [4, 3],
              [6, 5],
              [2, 1],
            ],
          ],
        },
      }),
      createZone({
        id: 'zone-2',
        name: 'Zona B',
        code: 'ZB',
        polygon: null,
      }),
      createZone({
        id: 'zone-3',
        name: 'Zona C',
        code: 'ZC',
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [8, 7],
              [10, 9],
              [12, 11],
              [8, 7],
            ],
          ],
        },
      }),
    ]);

    expect(viewModel.existingZonePolygons()).toEqual([
      [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
      [
        [7, 8],
        [9, 10],
        [11, 12],
      ],
    ]);
  });

  it('should keep existing zone polygons visible after save', async () => {
    zonesSignal.set([
      createZone({
        id: 'zone-2',
        name: 'Zona B',
        code: 'ZB',
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [2, 1],
              [4, 3],
              [6, 5],
              [2, 1],
            ],
          ],
        },
      }),
    ]);

    viewModel.zoneForm.setValue({
      name: 'Zona C',
      code: 'ZC',
      description: '',
    });
    viewModel.onPolygonSelected([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
      { lat: 5, lng: 6 },
    ]);
    mockZonesRepository.createWithRegions.mockResolvedValue({
      data: {
        zone_id: 'zone-3',
        zone_name: 'Zona C',
        region_points_count: 3,
        polygon: {
          type: 'Polygon',
          coordinates: [
            [
              [2, 1],
              [4, 3],
              [6, 5],
              [2, 1],
            ],
          ],
        },
      },
      error: null,
      message: null,
    });

    await viewModel.save();

    expect(viewModel.showExistingZonePolygons()).toBe(true);
    expect(viewModel.existingZonePolygons()).toHaveLength(1);
  });

  it('should count polygon points for an existing zone', () => {
    const zone = createZone({
      polygon: {
        type: 'Polygon',
        coordinates: [
          [
            [2, 1],
            [4, 3],
            [6, 5],
            [2, 1],
          ],
        ],
      },
    });

    expect(viewModel.zonePolygonPointCount(zone)).toBe(3);
  });

  it('should block saving when existing zones fail to load', async () => {
    mockZonesRepository.findAll.mockResolvedValueOnce({
      error: { message: 'failed' },
    });

    await viewModel.loadInitialData();

    expect(viewModel.zonesLoadFailed()).toBe(true);
    expect(viewModel.canSave()).toBe(false);
    expect(mockMessageService.error).toHaveBeenCalledWith(
      'Erro ao carregar zonas existentes.',
    );
  });
});

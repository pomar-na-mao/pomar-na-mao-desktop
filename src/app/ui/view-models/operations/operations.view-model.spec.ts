import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OperationsViewModel } from './operations.view-model';
import { OperationsRepository } from '../../../data/repositories/operations/operations-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { signal } from '@angular/core';

describe('OperationsViewModel', () => {
  let viewModel: OperationsViewModel;
  const mockSprayingOperationsSignal = signal([]);
  const mockInspectionOperationsSignal = signal([]);
  const mockAnnotationOperationsSignal = signal([]);
  const mockZonesSignal = signal<any[]>([]);
  const mockRegionsSignal = signal<any[]>([]);

  const mockGetSprayingOperations = vi.fn();
  const mockGetInspectionOperations = vi.fn();
  const mockGetAnnotationOperations = vi.fn();
  const mockGetBoundary = vi.fn();
  const mockZonesFindAll = vi.fn();
  const mockRegionsFindAll = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSprayingOperationsSignal.set([]);
    mockInspectionOperationsSignal.set([]);
    mockAnnotationOperationsSignal.set([]);
    mockZonesSignal.set([
      { id: 'zone-1', name: 'Zona Norte', polygon: { coordinates: [[[-49.1, -23.4], [-49.1, -23.5], [-49.2, -23.5], [-49.1, -23.4]]] } },
      { id: 'zone-2', name: 'Zona Sul', polygon: null }
    ]);
    mockRegionsSignal.set([
      { zone_id: 'zone-1', latitude: -23.4, longitude: -49.1, order: 1 },
      { zone_id: 'zone-1', latitude: -23.5, longitude: -49.1, order: 2 },
      { zone_id: 'zone-1', latitude: -23.5, longitude: -49.2, order: 3 },
    ]);
    mockGetBoundary.mockResolvedValue([]);
    mockZonesFindAll.mockResolvedValue({ error: null });
    mockRegionsFindAll.mockResolvedValue({ error: null });

    TestBed.configureTestingModule({
      providers: [
        OperationsViewModel,
        {
          provide: OperationsRepository,
          useValue: {
            getSprayingOperations: mockGetSprayingOperations,
            sprayingOperations: mockSprayingOperationsSignal,
            getInspectionOperations: mockGetInspectionOperations,
            inspectionOperations: mockInspectionOperationsSignal,
            getAnnotationOperations: mockGetAnnotationOperations,
            annotationOperations: mockAnnotationOperationsSignal
          }
        },
        {
          provide: FarmBoundaryService,
          useValue: {
            getBoundary: mockGetBoundary,
          },
        },
        {
          provide: ZonesRepository,
          useValue: {
            findAll: mockZonesFindAll,
            zones: mockZonesSignal
          }
        },
        {
          provide: RegionsRepository,
          useValue: {
            findAll: mockRegionsFindAll,
            regions: mockRegionsSignal
          }
        }
      ]
    });

    viewModel = TestBed.inject(OperationsViewModel);
  });

  it('should be created', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should load the farm boundary, zones, and regions on creation', async () => {
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetBoundary).toHaveBeenCalled();
    expect(mockZonesFindAll).toHaveBeenCalled();
    expect(mockRegionsFindAll).toHaveBeenCalled();
  });

  it('should provide zoneOptions populated from zones repository', () => {
    const options = viewModel.zoneOptions();
    expect(options).toEqual([
      { label: 'Todas as Zonas', value: '' },
      { label: 'Zona Norte', value: 'zone-1' },
      { label: 'Zona Sul', value: 'zone-2' }
    ]);
  });

  it('should fetch spraying operations without a zone filter when type is pulverizacao and no zone is selected', async () => {
    viewModel.startDate.set('2023-01-01');
    viewModel.endDate.set('2023-12-31');
    viewModel.selectedOperation.set('pulverizacao');

    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetSprayingOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', null);
  });

  it('should fetch spraying operations with zone filter when zone is selected', async () => {
    viewModel.startDate.set('2023-01-01');
    viewModel.endDate.set('2023-12-31');
    viewModel.selectedOperation.set('pulverizacao');
    viewModel.selectedZoneId.set('zone-1');

    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetSprayingOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-1');
  });

  it('should fetch inspection operations with zone filter when type is inspecao and zone is selected', async () => {
    viewModel.startDate.set('2023-01-01');
    viewModel.endDate.set('2023-12-31');
    viewModel.selectedOperation.set('inspecao');
    viewModel.selectedZoneId.set('zone-2');

    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetInspectionOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-2');
  });

  it('should fetch annotation operations with zone filter when type is anotacao and zone is selected', async () => {
    viewModel.startDate.set('2023-01-01');
    viewModel.endDate.set('2023-12-31');
    viewModel.selectedOperation.set('anotacao');
    viewModel.selectedZoneId.set('zone-1');

    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetAnnotationOperations).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 'zone-1');
  });

  it('should clear spraying operations when type is not pulverizacao', async () => {
    viewModel.selectedOperation.set('inspecao');

    TestBed.flushEffects();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(mockGetSprayingOperations).not.toHaveBeenCalled();
    expect(mockSprayingOperationsSignal()).toEqual([]);
  });

  it('should zoom to zone when onZoneChange is called', () => {
    const mockFitBounds = vi.fn();
    (viewModel as any).map = {
      fitBounds: mockFitBounds,
      setView: vi.fn()
    };

    viewModel.onZoneChange('zone-1');

    expect(viewModel.selectedZoneId()).toBe('zone-1');
    expect(mockFitBounds).toHaveBeenCalled();
  });

  it('should reset map view to boundary when onZoneChange is cleared', () => {
    const mockFitBounds = vi.fn();
    (viewModel as any).map = {
      fitBounds: mockFitBounds,
      setView: vi.fn()
    };
    (viewModel as any).farmBoundary.set({
      latLngs: [[-23.4, -49.1], [-23.5, -49.2], [-23.6, -49.3]],
      center: [-23.5, -49.2]
    });

    viewModel.onZoneChange('');

    expect(viewModel.selectedZoneId()).toBe('');
    expect(mockFitBounds).toHaveBeenCalled();
  });

  it('should destroy map and clear layer references on destroyMap', () => {
    const mockRemove = vi.fn();
    (viewModel as any).map = { remove: mockRemove };
    (viewModel as any).farmPolygonLayer = {};
    (viewModel as any).zonePolygonLayers = {};
    (viewModel as any).inspectionPlantLayers = {};
    (viewModel as any).geoJsonLayer = {};

    viewModel.destroyMap();

    expect(mockRemove).toHaveBeenCalled();
    expect((viewModel as any).map).toBeNull();
    expect((viewModel as any).farmPolygonLayer).toBeNull();
    expect((viewModel as any).zonePolygonLayers).toBeNull();
    expect((viewModel as any).inspectionPlantLayers).toBeNull();
    expect((viewModel as any).geoJsonLayer).toBeNull();
  });

  it('should navigate inspections and clear inspection selection', () => {
    const mockOp1 = { operation_id: 'op-1', started_at: '2023-01-01' } as any;
    const mockOp2 = { operation_id: 'op-2', started_at: '2023-01-02' } as any;
    const mockPlant1 = { plant_id: 'p-1', latitude: -23.4, longitude: -49.1 } as any;
    const mockPlant2 = { plant_id: 'p-1', latitude: -23.4, longitude: -49.1 } as any;

    viewModel.inspectionEntriesForPlant.set([
      { operation: mockOp1, plant: mockPlant1 },
      { operation: mockOp2, plant: mockPlant2 }
    ]);
    viewModel.currentInspectionIndex.set(0);
    viewModel.selectedInspectionDetails.set(mockOp1);
    viewModel.selectedInspectionPlant.set(mockPlant1);

    viewModel.navigateInspection('next');
    expect(viewModel.currentInspectionIndex()).toBe(1);
    expect(viewModel.selectedInspectionDetails()).toBe(mockOp2);

    viewModel.navigateInspection('prev');
    expect(viewModel.currentInspectionIndex()).toBe(0);
    expect(viewModel.selectedInspectionDetails()).toBe(mockOp1);

    viewModel.clearInspectionSelection();
    expect(viewModel.selectedInspectionDetails()).toBeNull();
    expect(viewModel.selectedInspectionPlant()).toBeNull();
    expect(viewModel.inspectionEntriesForPlant()).toEqual([]);
  });
});

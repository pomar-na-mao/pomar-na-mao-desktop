import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MassInclusionViewModel } from './mass-inclusion.view-model';
import { MassInclusionRepository } from '../../../data/repositories/mass-inclusion/mass-inclusion.repository';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { LoadingService } from '../../../data/services/loading';
import { MessageService } from '../../../data/services/message/message.service';
import { EMPTY_MASS_INCLUSION_DATA, type PolygonBulkSelectedPlant } from '../../../domain/models/mass-inclusion';
import type { Zone } from '../../../domain/models/zone.model';

function createZone(overrides: Partial<Zone> = {}): Zone {
  return {
    id: 'z1',
    name: 'Zona A',
    code: null,
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

function createPreviewPlant(overrides: Partial<PolygonBulkSelectedPlant> = {}): PolygonBulkSelectedPlant {
  return {
    plantId: 'p1',
    latitude: -21.23,
    longitude: -47.79,
    zoneId: 'z1',
    zoneName: 'Zona A',
    varietyId: 1,
    varietyName: 'Gala',
    plantingDate: null,
    selected: true,
    selectionSource: 'polygon_selected',
    ...overrides,
  };
}

describe('MassInclusionViewModel', () => {
  let viewModel: MassInclusionViewModel;
  let polygonCoordsSignal: ReturnType<typeof signal<{ lat: number; lng: number }[]>>;
  let previewPlantsSignal: ReturnType<typeof signal<PolygonBulkSelectedPlant[]>>;
  let varietyOptionsSignal: ReturnType<typeof signal<{ id: number; name: string }[]>>;
  let occurrenceTypeOptionsSignal: ReturnType<typeof signal<{ id: string; code: string; name: string }[]>>;

  let mockMassInclusionRepository: {
    selectedPolygonCoordinates: typeof polygonCoordsSignal;
    currentMassInclusionData: ReturnType<typeof signal<typeof EMPTY_MASS_INCLUSION_DATA>>;
    previewPlants: typeof previewPlantsSignal;
    varietyOptions: typeof varietyOptionsSignal;
    occurrenceTypeOptions: typeof occurrenceTypeOptionsSignal;
    savePolygonCoordinates: ReturnType<typeof vi.fn>;
    clearPolygonCoordinates: ReturnType<typeof vi.fn>;
    saveMassInclusionData: ReturnType<typeof vi.fn>;
    loadVarietyOptions: ReturnType<typeof vi.fn>;
    loadOccurrenceTypeOptions: ReturnType<typeof vi.fn>;
    previewPlantsInsidePolygon: ReturnType<typeof vi.fn>;
    setPlantSelected: ReturnType<typeof vi.fn>;
    clearPreviewPlants: ReturnType<typeof vi.fn>;
    syncPolygonBulkUpdate: ReturnType<typeof vi.fn>;
  };

  const zonesSignal = signal<Zone[]>([
    createZone(),
    createZone({ id: 'z2', name: 'Zona B' }),
  ]);

  const mockPlantsRepository = {
    queryPlants: vi.fn().mockResolvedValue([]),
  };

  const mockZonesRepository = {
    zones: zonesSignal,
    currentZone: signal<Zone | null>(null),
    findAll: vi.fn().mockResolvedValue(undefined),
  };

  const mockLoadingService = {
    isLoading: signal(false),
  };

  const mockMessageService = {
    success: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    mockZonesRepository.currentZone.set(null);
    mockPlantsRepository.queryPlants.mockResolvedValue([]);

    polygonCoordsSignal = signal([]);
    previewPlantsSignal = signal([]);
    varietyOptionsSignal = signal([{ id: 10, name: 'Gala' }]);
    occurrenceTypeOptionsSignal = signal([{ id: 'o1', code: 'mites', name: 'Acaros' }]);

    mockMassInclusionRepository = {
      selectedPolygonCoordinates: polygonCoordsSignal,
      currentMassInclusionData: signal(EMPTY_MASS_INCLUSION_DATA),
      previewPlants: previewPlantsSignal,
      varietyOptions: varietyOptionsSignal,
      occurrenceTypeOptions: occurrenceTypeOptionsSignal,
      savePolygonCoordinates: vi.fn((coords) => polygonCoordsSignal.set(coords)),
      clearPolygonCoordinates: vi.fn(() => polygonCoordsSignal.set([])),
      saveMassInclusionData: vi.fn(),
      loadVarietyOptions: vi.fn().mockResolvedValue({ data: varietyOptionsSignal(), error: null }),
      loadOccurrenceTypeOptions: vi.fn().mockResolvedValue({ data: occurrenceTypeOptionsSignal(), error: null }),
      previewPlantsInsidePolygon: vi.fn().mockImplementation(async () => {
        const plants = [createPreviewPlant()];
        previewPlantsSignal.set(plants);
        return { data: plants, error: null };
      }),
      setPlantSelected: vi.fn((plantId: string, selected: boolean) => {
        previewPlantsSignal.update((plants) =>
          plants.map((plant) => plant.plantId === plantId ? { ...plant, selected } : plant)
        );
      }),
      clearPreviewPlants: vi.fn(() => previewPlantsSignal.set([])),
      syncPolygonBulkUpdate: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        MassInclusionViewModel,
        { provide: MassInclusionRepository, useValue: mockMassInclusionRepository },
        { provide: PlantsRepository, useValue: mockPlantsRepository },
        { provide: ZonesRepository, useValue: mockZonesRepository },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    });

    viewModel = TestBed.inject(MassInclusionViewModel);
  });

  it('should create and map zone/options signals', () => {
    expect(viewModel).toBeTruthy();
    expect(viewModel.zoneOptions()).toEqual([
      { value: '', label: 'Nenhum' },
      { value: 'z1', label: 'Zona A' },
      { value: 'z2', label: 'Zona B' },
    ]);
    expect(viewModel.varietyOptions()).toEqual([{ value: '10', label: 'Gala' }]);
    expect(viewModel.occurrenceOptions()).toEqual([{ value: 'o1', label: 'Acaros' }]);
  });

  it('loadZones should load zones and database-backed form options', async () => {
    await viewModel.loadZones();

    expect(mockZonesRepository.findAll).toHaveBeenCalled();
    expect(mockMassInclusionRepository.loadVarietyOptions).toHaveBeenCalled();
    expect(mockMassInclusionRepository.loadOccurrenceTypeOptions).toHaveBeenCalled();
    expect(viewModel.isLoadingZones()).toBe(false);
  });

  it('should load map plants filtered by zone id', async () => {
    const plants = [{ id: 'plant-1', latitude: -21.23, longitude: -47.79 }] as never[];
    mockPlantsRepository.queryPlants.mockResolvedValueOnce(plants);

    await viewModel.onZoneChange('z1');

    expect(mockPlantsRepository.queryPlants).toHaveBeenCalledWith({ zoneId: 'z1' });
    expect(mockZonesRepository.currentZone()).toEqual(createZone());
    expect(viewModel.plants()).toEqual(plants);
  });

  it('should save only valid polygons', () => {
    viewModel.onPolygonSelected([{ lat: 1, lng: 2 }]);
    expect(mockMassInclusionRepository.savePolygonCoordinates).not.toHaveBeenCalled();

    const coords = [{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }];
    viewModel.onPolygonSelected(coords);
    expect(mockMassInclusionRepository.savePolygonCoordinates).toHaveBeenCalledWith(coords);
  });

  it('should generate preview and select returned plants by default', async () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]);

    await viewModel.onPreviewPlantsInsidePolygonHandler();

    expect(mockMassInclusionRepository.previewPlantsInsidePolygon).toHaveBeenCalledWith({
      type: 'Polygon',
      coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]],
    });
    expect(viewModel.previewLoaded()).toBe(true);
    expect(viewModel.selectedPlantsCount()).toBe(1);
  });

  it('should block confirmation until preview is loaded', async () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]);
    viewModel.onOccurrencesChange('o1');

    await viewModel.onSaveMassInclusionDataHandler();

    expect(mockMassInclusionRepository.syncPolygonBulkUpdate).not.toHaveBeenCalled();
    expect(mockMessageService.error).toHaveBeenCalledWith('Gere a prévia das plantas antes de confirmar.');
  });

  it('should block confirmation when no selected plants remain', async () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]);
    previewPlantsSignal.set([createPreviewPlant({ selected: false })]);
    viewModel.previewLoaded.set(true);
    viewModel.onOccurrencesChange('o1');

    await viewModel.onSaveMassInclusionDataHandler();

    expect(mockMassInclusionRepository.syncPolygonBulkUpdate).not.toHaveBeenCalled();
    expect(mockMessageService.error).toHaveBeenCalledWith('Selecione ao menos uma planta para confirmar.');
  });

  it('should block confirmation when no supported changes are selected', async () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]);
    previewPlantsSignal.set([createPreviewPlant()]);
    viewModel.previewLoaded.set(true);

    await viewModel.onSaveMassInclusionDataHandler();

    expect(mockMassInclusionRepository.syncPolygonBulkUpdate).not.toHaveBeenCalled();
    expect(mockMessageService.error).toHaveBeenCalledWith('Selecione ao menos uma alteração para confirmar.');
  });

  it('should allow confirmation when only life of tree is selected', () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]);
    previewPlantsSignal.set([createPreviewPlant()]);
    viewModel.previewLoaded.set(true);
    viewModel.massInclusionDataForm.controls.lifeOfTree.setValue('Primeira (1)');

    expect(viewModel.canConfirm()).toBe(true);
  });

  it('should build payload, save, and reset state on success', async () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]);
    previewPlantsSignal.set([createPreviewPlant()]);
    viewModel.previewLoaded.set(true);
    viewModel.onOccurrencesChange('o1');
    viewModel.onVarietyChange('10');
    viewModel.massInclusionDataForm.controls.lifeOfTree.setValue('Primeira (1)');
    viewModel.massInclusionDataForm.controls.plantingDate.setValue('2026-05-31');
    viewModel.massInclusionDataForm.controls.description.setValue('Teste');
    mockMassInclusionRepository.syncPolygonBulkUpdate.mockResolvedValue({
      data: {
        fieldOperationId: 'op1',
        plantsChangedCount: 1,
        occurrencesCreatedCount: 1,
        occurrencesUpdatedCount: 0,
        attributesUpdatedCount: 2,
      },
      error: null,
    });

    await viewModel.onSaveMassInclusionDataHandler();

    expect(mockMassInclusionRepository.syncPolygonBulkUpdate).toHaveBeenCalledWith(expect.objectContaining({
      plants: [{ plantId: 'p1', selectionSource: 'polygon_selected' }],
      plantsFoundCount: 1,
      occurrences: [{ occurrenceTypeId: 'o1', code: 'mites', name: 'Acaros', notes: 'Teste', severity: null }],
      varietyId: 10,
      lifeOfTree: 'Primeira (1)',
      plantingDate: '2026-05-31',
      notes: 'Teste',
    }));
    expect(mockMessageService.success).toHaveBeenCalled();
    expect(mockMassInclusionRepository.clearPolygonCoordinates).toHaveBeenCalled();
    expect(viewModel.clearMapSignal()).toBe(1);
  });

  it('should keep review state available after save errors', async () => {
    polygonCoordsSignal.set([{ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, { lat: 5, lng: 6 }]);
    previewPlantsSignal.set([createPreviewPlant()]);
    viewModel.previewLoaded.set(true);
    viewModel.onOccurrencesChange('o1');
    mockMassInclusionRepository.syncPolygonBulkUpdate.mockResolvedValue({
      data: null,
      error: { message: 'failed' },
    });

    await viewModel.onSaveMassInclusionDataHandler();

    expect(mockMessageService.error).toHaveBeenCalledWith('Erro ao salvar as alterações em massa.');
    expect(viewModel.previewLoaded()).toBe(true);
    expect(viewModel.previewPlants()).toHaveLength(1);
    expect(mockMassInclusionRepository.clearPolygonCoordinates).not.toHaveBeenCalled();
  });
});

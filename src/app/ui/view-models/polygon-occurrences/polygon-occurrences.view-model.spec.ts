import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PolygonOccurrencesRepository } from '../../../data/repositories/polygon-occurrences/polygon-occurrences.repository';
import { RegionsRepository } from '../../../data/repositories/regions/regions-repository';
import { ZonesRepository } from '../../../data/repositories/zones/zones-repository';
import { FarmBoundaryService } from '../../../data/services/farm-boundary/farm-boundary-service';
import { MessageService } from '../../../data/services/message/message.service';
import type { PolygonOccurrencePreviewPlant } from '../../../domain/models/polygon-occurrences';
import type { Zone } from '../../../domain/models/zone.model';
import { LoadingService } from '../../../shared/services/loading.service';
import { PolygonOccurrencesViewModel } from './polygon-occurrences.view-model';

describe('PolygonOccurrencesViewModel', () => {
  const coordinates = signal<{ lat: number; lng: number }[]>([]);
  const previewPlants = signal<PolygonOccurrencePreviewPlant[]>([]);
  const options = signal([{ id: 'o1', code: 'broca', name: 'Broca' }]);
  const zones = signal<Zone[]>([{ id: 'z1', name: 'Zona A' } as Zone]);
  const currentZone = signal<Zone | null>(null);
  const messages = { success: vi.fn(), error: vi.fn() };
  const loading = { show: vi.fn(), hide: vi.fn() };
  const repository = {
    selectedPolygonCoordinates: coordinates,
    previewPlants,
    occurrenceTypeOptions: options,
    savePolygonCoordinates: vi.fn((value) => { coordinates.set(value); previewPlants.set([]); }),
    clearPolygon: vi.fn(() => { coordinates.set([]); previewPlants.set([]); }),
    clearPreview: vi.fn(() => previewPlants.set([])),
    loadOccurrenceTypeOptions: vi.fn(),
    previewPlantsInsidePolygon: vi.fn(),
    syncPolygonOccurrences: vi.fn(),
  };
  const zonesRepository = { zones, currentZone, findAll: vi.fn() };
  const regionsRepository = { findByZoneId: vi.fn() };
  let viewModel: PolygonOccurrencesViewModel;

  beforeEach(() => {
    vi.clearAllMocks();
    coordinates.set([]);
    previewPlants.set([]);
    currentZone.set(null);
    repository.loadOccurrenceTypeOptions.mockResolvedValue({ data: options(), error: null });
    repository.previewPlantsInsidePolygon.mockImplementation(async () => {
      const plants = [{
        plantId: 'p1', latitude: 1, longitude: 2, zoneId: 'z1', zoneName: 'Zona A',
        varietyId: null, varietyName: null, plantingDate: null,
      }];
      previewPlants.set(plants);
      return { data: plants, error: null };
    });
    zonesRepository.findAll.mockResolvedValue({ error: null });
    regionsRepository.findByZoneId.mockResolvedValue({
      data: [
        { latitude: 1, longitude: 2 }, { latitude: 2, longitude: 3 }, { latitude: 3, longitude: 1 },
      ],
      error: null,
    });

    TestBed.configureTestingModule({
      providers: [
        PolygonOccurrencesViewModel,
        { provide: PolygonOccurrencesRepository, useValue: repository },
        { provide: ZonesRepository, useValue: zonesRepository },
        { provide: RegionsRepository, useValue: regionsRepository },
        { provide: FarmBoundaryService, useValue: { getBoundary: vi.fn().mockResolvedValue([]) } },
        { provide: MessageService, useValue: messages },
        { provide: LoadingService, useValue: loading },
      ],
    });
    viewModel = TestBed.inject(PolygonOccurrencesViewModel);
  });

  it('loads options and uses the selected zone only as map context', async () => {
    await viewModel.loadInitialData();
    await viewModel.onZoneChange('z1');

    expect(repository.loadOccurrenceTypeOptions).toHaveBeenCalled();
    expect(viewModel.zonePolygonCoords()).toEqual([[1, 2], [2, 3], [3, 1]]);
    expect(coordinates()).toEqual([]);
  });

  it('previews plants and invalidates them after a new polygon', async () => {
    viewModel.onPolygonSelected([{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, { lat: 3, lng: 1 }]);
    TestBed.flushEffects();
    await viewModel.preview();
    expect(viewModel.previewLoaded()).toBe(true);
    expect(viewModel.plantsFoundCount()).toBe(1);

    viewModel.onPolygonSelected([{ lat: 4, lng: 4 }, { lat: 5, lng: 5 }, { lat: 6, lng: 4 }]);
    expect(viewModel.previewLoaded()).toBe(false);
    expect(viewModel.previewPlants()).toEqual([]);
  });

  it('handles empty and failed previews without enabling save', async () => {
    viewModel.onPolygonSelected([{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, { lat: 3, lng: 1 }]);
    TestBed.flushEffects();
    repository.previewPlantsInsidePolygon.mockResolvedValueOnce({ data: [], error: null });
    await viewModel.preview();
    expect(viewModel.previewError()).toContain('Nenhuma planta');
    expect(viewModel.canConfirm()).toBe(false);

    repository.previewPlantsInsidePolygon.mockResolvedValueOnce({ data: null, error: {} });
    await viewModel.preview();
    expect(viewModel.previewLoaded()).toBe(false);
  });

  it('requires polygon, current preview and occurrence selection', async () => {
    expect(viewModel.canConfirm()).toBe(false);
    viewModel.onPolygonSelected([{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, { lat: 3, lng: 1 }]);
    TestBed.flushEffects();
    await viewModel.preview();
    expect(viewModel.canConfirm()).toBe(false);
    viewModel.onOccurrencesChange('o1');
    expect(viewModel.canConfirm()).toBe(true);
    viewModel.onPolygonCleared();
    expect(viewModel.canConfirm()).toBe(false);
  });

  it('saves through the dedicated RPC and clears state only on success', async () => {
    repository.syncPolygonOccurrences.mockResolvedValue({
      data: {
        fieldOperationId: 'op1', plantsProcessedCount: 1, plantsChangedCount: 1,
        occurrencesCreatedCount: 1, occurrencesResolvedCount: 0, occurrencesUnchangedCount: 0,
      },
      error: null,
    });
    viewModel.onPolygonSelected([{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, { lat: 3, lng: 1 }]);
    TestBed.flushEffects();
    await viewModel.preview();
    viewModel.onOccurrencesChange('o1');
    await viewModel.save();

    expect(repository.syncPolygonOccurrences).toHaveBeenCalledWith(expect.objectContaining({
      occurrenceAction: 'add', occurrenceTypeIds: ['o1'], previewPlantsFoundCount: 1,
    }));
    expect(messages.success).toHaveBeenCalledWith(expect.stringContaining('1 criadas'));
    expect(coordinates()).toEqual([]);
  });

  it('preserves polygon and preview when save fails', async () => {
    repository.syncPolygonOccurrences.mockResolvedValue({ data: null, error: {} });
    viewModel.onPolygonSelected([{ lat: 1, lng: 1 }, { lat: 2, lng: 2 }, { lat: 3, lng: 1 }]);
    TestBed.flushEffects();
    await viewModel.preview();
    viewModel.onOccurrencesChange('o1');
    await viewModel.save();

    expect(coordinates()).toHaveLength(3);
    expect(previewPlants()).toHaveLength(1);
    expect(messages.error).toHaveBeenCalledWith('Erro ao salvar as ocorrências da área.');
  });
});


import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MassInclusionRepository } from './mass-inclusion.repository';
import { MassInclusionService } from '../../services/mass-inclusion/mass-inclusion.service';
import {
  EMPTY_MASS_INCLUSION_DATA,
  type GeoJsonPolygon,
  type MassInclusionData,
  type PolygonBulkUpdatePayload,
} from '../../../domain/models/mass-inclusion';

const mockFindPlantsInsidePolygon = vi.fn();
const mockFindVarietyOptions = vi.fn();
const mockFindOccurrenceTypeOptions = vi.fn();
const mockSyncPolygonBulkUpdate = vi.fn();

describe('MassInclusionRepository', () => {
  let repo: MassInclusionRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MassInclusionRepository,
        {
          provide: MassInclusionService,
          useValue: {
            findPlantsInsidePolygon: mockFindPlantsInsidePolygon,
            findVarietyOptions: mockFindVarietyOptions,
            findOccurrenceTypeOptions: mockFindOccurrenceTypeOptions,
            syncPolygonBulkUpdate: mockSyncPolygonBulkUpdate,
          },
        },
      ],
    });

    repo = TestBed.inject(MassInclusionRepository);
  });

  it('should start with empty state', () => {
    expect(repo.selectedPolygonCoordinates()).toEqual([]);
    expect(repo.currentMassInclusionData()).toEqual(EMPTY_MASS_INCLUSION_DATA);
    expect(repo.previewPlants()).toEqual([]);
  });

  it('should save coordinates and clear stale preview', async () => {
    mockFindPlantsInsidePolygon.mockResolvedValue({
      data: [{
        plantId: 'p1',
        latitude: 1,
        longitude: 2,
        zoneId: null,
        zoneName: null,
        varietyId: null,
        varietyName: null,
        plantingDate: null,
      }],
      error: null,
    });

    await repo.previewPlantsInsidePolygon({ type: 'Polygon', coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]] });
    repo.savePolygonCoordinates([{ lat: 10, lng: 20 }]);

    expect(repo.selectedPolygonCoordinates()).toEqual([{ lat: 10, lng: 20 }]);
    expect(repo.previewPlants()).toEqual([]);
  });

  it('should persist mass inclusion data', () => {
    const data: MassInclusionData = {
      occurrenceAction: 'remove',
      occurrences: ['o1'],
      varietyId: '3',
      lifeOfTree: '3 anos',
      plantingDate: '2022-01-01',
      description: 'Desc',
    };

    repo.saveMassInclusionData(data);

    expect(repo.currentMassInclusionData()).toEqual(data);
  });

  it('should load database-backed options into signals', async () => {
    mockFindVarietyOptions.mockResolvedValue({ data: [{ id: 1, name: 'Gala' }], error: null });
    mockFindOccurrenceTypeOptions.mockResolvedValue({ data: [{ id: 'o1', code: 'mites', name: 'Ácaros' }], error: null });

    await repo.loadVarietyOptions();
    await repo.loadOccurrenceTypeOptions();

    expect(repo.varietyOptions()).toEqual([{ id: 1, name: 'Gala' }]);
    expect(repo.occurrenceTypeOptions()).toEqual([{ id: 'o1', code: 'mites', name: 'Ácaros' }]);
  });

  it('should preview plants selected by default', async () => {
    const polygon: GeoJsonPolygon = { type: 'Polygon', coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]] };
    mockFindPlantsInsidePolygon.mockResolvedValue({
      data: [{
        plantId: 'p1',
        latitude: 1,
        longitude: 2,
        zoneId: 'z1',
        zoneName: 'Zona A',
        varietyId: 1,
        varietyName: 'Gala',
        plantingDate: null,
      }],
      error: null,
    });

    const result = await repo.previewPlantsInsidePolygon(polygon);

    expect(mockFindPlantsInsidePolygon).toHaveBeenCalledWith(polygon);
    expect(result.data?.[0]).toMatchObject({
      plantId: 'p1',
      selected: true,
      selectionSource: 'polygon_selected',
    });
    expect(repo.previewPlants()[0].selected).toBe(true);
  });

  it('should update selected plant review state', async () => {
    mockFindPlantsInsidePolygon.mockResolvedValue({
      data: [{
        plantId: 'p1',
        latitude: 1,
        longitude: 2,
        zoneId: null,
        zoneName: null,
        varietyId: null,
        varietyName: null,
        plantingDate: null,
      }],
      error: null,
    });

    await repo.previewPlantsInsidePolygon({ type: 'Polygon', coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]] });
    repo.setPlantSelected('p1', false);

    expect(repo.previewPlants()[0]).toMatchObject({
      selected: false,
      selectionSource: 'user_removed',
    });
  });

  it('should delegate confirmed save to service', async () => {
    const payload: PolygonBulkUpdatePayload = {
      polygonGeojson: { type: 'Polygon', coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]] },
      plants: [{ plantId: 'p1', selectionSource: 'polygon_selected' }],
      plantsFoundCount: 1,
      occurrenceAction: 'add',
      occurrences: [],
      varietyId: 1,
      lifeOfTree: null,
      plantingDate: null,
      notes: null,
      startedAt: '2026-05-31T12:00:00Z',
      finishedAt: '2026-05-31T12:00:00Z',
    };
    const expected = { data: { fieldOperationId: 'op1' }, error: null };
    mockSyncPolygonBulkUpdate.mockResolvedValue(expected);

    const result = await repo.syncPolygonBulkUpdate(payload);

    expect(mockSyncPolygonBulkUpdate).toHaveBeenCalledWith(payload);
    expect(result).toEqual(expected);
  });
});

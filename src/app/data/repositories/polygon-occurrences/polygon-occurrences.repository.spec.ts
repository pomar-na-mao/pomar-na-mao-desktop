import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PolygonOccurrencePayload } from '../../../domain/models/polygon-occurrences';
import { PolygonOccurrencesService } from '../../services/polygon-occurrences/polygon-occurrences.service';
import { PolygonOccurrencesRepository } from './polygon-occurrences.repository';

describe('PolygonOccurrencesRepository', () => {
  const findOccurrenceTypeOptions = vi.fn();
  const findPlantsInsidePolygon = vi.fn();
  const syncPolygonOccurrences = vi.fn();
  let repository: PolygonOccurrencesRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        PolygonOccurrencesRepository,
        {
          provide: PolygonOccurrencesService,
          useValue: { findOccurrenceTypeOptions, findPlantsInsidePolygon, syncPolygonOccurrences },
        },
      ],
    });
    repository = TestBed.inject(PolygonOccurrencesRepository);
  });

  it('stores options and preview data returned by the service', async () => {
    findOccurrenceTypeOptions.mockResolvedValue({
      data: [{ id: 'o1', code: 'broca', name: 'Broca' }], error: null,
    });
    findPlantsInsidePolygon.mockResolvedValue({
      data: [{ plantId: 'p1', latitude: 1, longitude: 2 }], error: null,
    });
    const polygon = { type: 'Polygon' as const, coordinates: [[[1, 1], [2, 2], [3, 1], [1, 1]]] };

    await repository.loadOccurrenceTypeOptions();
    await repository.previewPlantsInsidePolygon(polygon);

    expect(repository.occurrenceTypeOptions()).toHaveLength(1);
    expect(repository.previewPlants()).toEqual([{ plantId: 'p1', latitude: 1, longitude: 2 }]);
  });

  it('invalidates stale preview when polygon changes or clears', async () => {
    findPlantsInsidePolygon.mockResolvedValue({ data: [{ plantId: 'p1' }], error: null });
    await repository.previewPlantsInsidePolygon({ type: 'Polygon', coordinates: [] });

    repository.savePolygonCoordinates([{ lat: 1, lng: 2 }, { lat: 2, lng: 3 }, { lat: 3, lng: 1 }]);
    expect(repository.previewPlants()).toEqual([]);
    expect(repository.selectedPolygonCoordinates()).toHaveLength(3);

    repository.clearPolygon();
    expect(repository.selectedPolygonCoordinates()).toEqual([]);
  });

  it('delegates save without changing the payload', async () => {
    const payload = { occurrenceAction: 'remove' } as PolygonOccurrencePayload;
    const expected = { data: { fieldOperationId: 'op1' }, error: null };
    syncPolygonOccurrences.mockResolvedValue(expected);

    await expect(repository.syncPolygonOccurrences(payload)).resolves.toEqual(expected);
    expect(syncPolygonOccurrences).toHaveBeenCalledWith(payload);
  });
});


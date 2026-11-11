import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PolygonOccurrencePayload } from '../../../domain/models/polygon-occurrences';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { PolygonOccurrencesService } from './polygon-occurrences.service';

describe('PolygonOccurrencesService', () => {
  const rpc = vi.fn();
  const from = vi.fn();
  let service: PolygonOccurrencesService;
  let cache: SupabaseRequestCacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        PolygonOccurrencesService,
        {
          provide: SupabaseService,
          useValue: { getClient: () => ({ rpc, from }) as unknown as SupabaseClient },
        },
      ],
    });
    service = TestBed.inject(PolygonOccurrencesService);
    cache = TestBed.inject(SupabaseRequestCacheService);
  });

  it('loads occurrence types with a cached reference query', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 'o1', code: 'broca', name: 'Broca' }],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ order });
    from.mockReturnValue({ select });

    const first = await service.findOccurrenceTypeOptions();
    const second = await service.findOccurrenceTypeOptions();

    expect(from).toHaveBeenCalledWith('occurrence_types');
    expect(select).toHaveBeenCalledWith('id,code,name');
    expect(first.data).toEqual([{ id: 'o1', code: 'broca', name: 'Broca' }]);
    expect(second).toEqual(first);
    expect(from).toHaveBeenCalledTimes(1);
  });

  it('maps the polygon preview RPC response', async () => {
    const polygon = { type: 'Polygon' as const, coordinates: [[[1, 1], [2, 2], [3, 1], [1, 1]]] };
    rpc.mockResolvedValue({
      data: [{
        plant_id: 'p1', latitude: 1, longitude: 2, zone_id: 'z1', zone_name: 'Zona A',
        variety_id: 4, variety_name: 'Gala', planting_date: null,
      }],
      error: null,
    });

    const result = await service.findPlantsInsidePolygon(polygon);

    expect(rpc).toHaveBeenCalledWith('find_plants_inside_polygon', { p_polygon_geojson: polygon });
    expect(result.data).toEqual([{
      plantId: 'p1', latitude: 1, longitude: 2, zoneId: 'z1', zoneName: 'Zona A',
      varietyId: 4, varietyName: 'Gala', plantingDate: null,
    }]);
  });

  it('maps all result counters and invalidates affected caches after success', async () => {
    const invalidate = vi.spyOn(cache, 'invalidate');
    const payload = {
      polygonGeojson: { type: 'Polygon', coordinates: [[[1, 1], [2, 2], [3, 1], [1, 1]]] },
      occurrenceAction: 'add', occurrenceTypeIds: ['o1'], previewPlantsFoundCount: 1,
      zoneId: null, startedAt: '2026-11-11T12:00:00Z', finishedAt: '2026-11-11T12:00:00Z',
    } as PolygonOccurrencePayload;
    rpc.mockResolvedValue({
      data: [{
        field_operation_id: 'op1', plants_processed_count: 2, plants_changed_count: 1,
        occurrences_created_count: 1, occurrences_resolved_count: 0,
        occurrences_unchanged_count: 1,
      }],
      error: null,
    });

    const result = await service.syncPolygonOccurrences(payload);

    expect(rpc).toHaveBeenCalledWith('sync_polygon_occurrences', { p_payload: payload });
    expect(result.data).toEqual({
      fieldOperationId: 'op1', plantsProcessedCount: 2, plantsChangedCount: 1,
      occurrencesCreatedCount: 1, occurrencesResolvedCount: 0, occurrencesUnchangedCount: 1,
    });
    expect(invalidate).toHaveBeenCalledWith([
      'plants', 'plant-counters', 'overview', 'operations', 'occurrences',
    ]);
  });

  it('does not invalidate caches when save fails', async () => {
    const invalidate = vi.spyOn(cache, 'invalidate');
    rpc.mockResolvedValue({ data: null, error: { message: 'failed' } });

    const result = await service.syncPolygonOccurrences({} as PolygonOccurrencePayload);

    expect(result.error).toEqual({ message: 'failed' });
    expect(invalidate).not.toHaveBeenCalled();
  });
});


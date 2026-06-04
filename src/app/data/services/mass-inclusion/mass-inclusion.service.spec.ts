import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MassInclusionService } from './mass-inclusion.service';
import { SupabaseService } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { GeoJsonPolygon, PolygonBulkUpdatePayload } from '../../../domain/models/mass-inclusion';

describe('MassInclusionService', () => {
  let service: MassInclusionService;
  const mockRpc = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      rpc: mockRpc,
      from: mockFrom,
    } as Partial<SupabaseClient>;

    TestBed.configureTestingModule({
      providers: [
        MassInclusionService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient as SupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(MassInclusionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call find_plants_inside_polygon and map snake_case rows', async () => {
    const polygon: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [[[-47.79, -21.23], [-47.78, -21.24], [-47.80, -21.25], [-47.79, -21.23]]],
    };

    mockRpc.mockResolvedValue({
      data: [{
        plant_id: 'p1',
        latitude: -21.23,
        longitude: -47.79,
        zone_id: 'z1',
        zone_name: 'Zona A',
        variety_id: 10,
        variety_name: 'Fuji',
        planting_date: '2025-01-01T00:00:00Z',
      }],
      error: null,
    });

    const result = await service.findPlantsInsidePolygon(polygon);

    expect(mockRpc).toHaveBeenCalledWith('find_plants_inside_polygon', {
      p_polygon_geojson: polygon,
    });
    expect(result.data).toEqual([{
      plantId: 'p1',
      latitude: -21.23,
      longitude: -47.79,
      zoneId: 'z1',
      zoneName: 'Zona A',
      varietyId: 10,
      varietyName: 'Fuji',
      plantingDate: '2025-01-01T00:00:00Z',
    }]);
    expect(result.error).toBeNull();
  });

  it('should load variety options from Supabase', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Gala', description: null }],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.findVarietyOptions();

    expect(mockFrom).toHaveBeenCalledWith('varieties');
    expect(select).toHaveBeenCalledWith('id,name,description');
    expect(order).toHaveBeenCalledWith('name');
    expect(result.data).toEqual([{ id: 1, name: 'Gala', description: null }]);
  });

  it('should load occurrence type options from Supabase', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [{ id: 'o1', code: 'mites', name: 'Ácaros' }],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.findOccurrenceTypeOptions();

    expect(mockFrom).toHaveBeenCalledWith('occurrence_types');
    expect(select).toHaveBeenCalledWith('id,code,name');
    expect(order).toHaveBeenCalledWith('name');
    expect(result.data).toEqual([{ id: 'o1', code: 'mites', name: 'Ácaros' }]);
  });

  it('should call sync_polygon_bulk_update for confirmed saves and map result counts', async () => {
    const payload: PolygonBulkUpdatePayload = {
      polygonGeojson: {
        type: 'Polygon',
        coordinates: [[[-47.79, -21.23], [-47.78, -21.24], [-47.80, -21.25], [-47.79, -21.23]]],
      },
      plants: [{ plantId: 'p1', selectionSource: 'polygon_selected' }],
      plantsFoundCount: 1,
      occurrences: [],
      varietyId: 2,
      lifeOfTree: null,
      plantingDate: null,
      notes: null,
      startedAt: '2026-05-31T12:00:00Z',
      finishedAt: '2026-05-31T12:00:00Z',
    };

    mockRpc.mockResolvedValue({
      data: [{
        field_operation_id: 'op1',
        plants_changed_count: 1,
        occurrences_created_count: 0,
        occurrences_updated_count: 0,
        attributes_updated_count: 1,
      }],
      error: null,
    });

    const result = await service.syncPolygonBulkUpdate(payload);

    expect(mockRpc).toHaveBeenCalledWith('sync_polygon_bulk_update', {
      p_payload: payload,
    });
    expect(result.data).toEqual({
      fieldOperationId: 'op1',
      plantsChangedCount: 1,
      occurrencesCreatedCount: 0,
      occurrencesUpdatedCount: 0,
      attributesUpdatedCount: 1,
    });
  });
});

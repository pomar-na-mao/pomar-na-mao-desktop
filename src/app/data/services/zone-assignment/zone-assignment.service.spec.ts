import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ZoneAssignmentService } from './zone-assignment.service';
import type { GeoJsonPolygon } from '../../../domain/models/mass-inclusion';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';

describe('ZoneAssignmentService', () => {
  let service: ZoneAssignmentService;
  let mockRpc: ReturnType<typeof vi.fn>;
  let mockCacheRead: ReturnType<typeof vi.fn>;
  let mockCacheInvalidate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRpc = vi.fn();
    mockCacheRead = vi.fn().mockImplementation((_opts: unknown, fn: () => unknown) => fn());
    mockCacheInvalidate = vi.fn();

    const mockSupabase = {
      rpc: mockRpc,
    } as unknown as SupabaseClient;

    TestBed.configureTestingModule({
      providers: [
        ZoneAssignmentService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabase,
          },
        },
        {
          provide: SupabaseRequestCacheService,
          useValue: {
            read: mockCacheRead,
            invalidate: mockCacheInvalidate,
          },
        },
      ],
    });

    service = TestBed.inject(ZoneAssignmentService);
  });

  it('calls get_all_plants_for_map rpc and returns plants', async () => {
    const mockPlants = [
      { id: '1', latitude: -23.1, longitude: -49.1, zoneId: null, varietyName: 'Hass' },
    ];
    mockRpc.mockResolvedValue({ data: mockPlants, error: null });

    const result = await service.getAllPlantsForMap();

    expect(mockRpc).toHaveBeenCalledWith('get_all_plants_for_map');
    expect(result.data).toEqual(mockPlants);
    expect(result.error).toBeNull();
  });

  it('calls find_plants_inside_polygon rpc and maps result', async () => {
    const mockRows = [
      {
        plant_id: 'p1',
        latitude: -23.1,
        longitude: -49.1,
        zone_id: null,
        zone_name: null,
        variety_id: 1,
        variety_name: 'Hass',
        planting_date: '2026-01-01',
      },
    ];
    mockRpc.mockResolvedValue({ data: mockRows, error: null });

    const polygon: GeoJsonPolygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-49.1, -23.1],
          [-49.2, -23.2],
          [-49.1, -23.1],
        ],
      ],
    };

    const result = await service.findPlantsInsidePolygon(polygon);

    expect(mockRpc).toHaveBeenCalledWith('find_plants_inside_polygon', {
      p_polygon_geojson: polygon,
    });
    expect(result.data).toEqual([
      {
        plantId: 'p1',
        latitude: -23.1,
        longitude: -49.1,
        zoneId: null,
        zoneName: null,
        varietyId: 1,
        varietyName: 'Hass',
        plantingDate: '2026-01-01',
        selected: true,
      },
    ]);
  });

  it('calls assign_plants_to_zone rpc, invalidates cache and returns summary', async () => {
    mockRpc.mockResolvedValue({
      data: {
        zone_id: 'z1',
        zone_name: 'Zona A',
        plants_updated_count: 5,
      },
      error: null,
    });

    const result = await service.assignPlantsToZone({
      zoneId: 'z1',
      plantIds: ['p1', 'p2'],
    });

    expect(mockRpc).toHaveBeenCalledWith('assign_plants_to_zone', {
      p_zone_id: 'z1',
      p_plant_ids: ['p1', 'p2'],
    });
    expect(mockCacheInvalidate).toHaveBeenCalled();
    expect(result.data).toEqual({
      zoneId: 'z1',
      zoneName: 'Zona A',
      plantsUpdatedCount: 5,
    });
  });
});
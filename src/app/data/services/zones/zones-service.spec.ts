import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { ZonesService } from './zones-service';

describe('ZonesService', () => {
  let service: ZonesService;
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ZonesService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom, rpc: mockRpc }) as Partial<SupabaseClient> as SupabaseClient
          }
        }
      ]
    });

    service = TestBed.inject(ZonesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll should query all zones ordered by name', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.findAll();
    const cachedResult = await service.findAll();

    expect(mockFrom).toHaveBeenCalledWith('zones');
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(order).toHaveBeenCalledWith('name', { ascending: true });
    expect(result).toBe(mockResponse);
    expect(cachedResult).toBe(mockResponse);
  });

  it('findById should query a single zone by id', async () => {
    const mockResponse = { data: { id: 'zone-1' }, error: null };
    const single = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.findById('zone-1');

    expect(eq).toHaveBeenCalledWith('id', 'zone-1');
    expect(single).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });

  it('createWithRegions should call the zone creation RPC and invalidate cached map references on success', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        zone_id: 'zone-1',
        zone_name: 'Zona A',
        region_points_count: 3,
        polygon: { type: 'Polygon', coordinates: [] },
      },
      error: null,
    });
    mockRpc.mockReturnValue({ single });
    const cache = TestBed.inject(SupabaseRequestCacheService);
    const invalidate = vi.spyOn(cache, 'invalidate');

    await service.createWithRegions({
      name: 'Zona A',
      code: 'ZA',
      description: 'Nova zona',
      polygonGeojson: {
        type: 'Polygon',
        coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]],
      },
      points: [
        { latitude: 1, longitude: 2 },
        { latitude: 3, longitude: 4 },
        { latitude: 5, longitude: 6 },
      ],
    });

    expect(mockRpc).toHaveBeenCalledWith('create_zone_with_regions', {
      p_name: 'Zona A',
      p_code: 'ZA',
      p_description: 'Nova zona',
      p_polygon_geojson: {
        type: 'Polygon',
        coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]],
      },
      p_points: [
        { latitude: 1, longitude: 2 },
        { latitude: 3, longitude: 4 },
        { latitude: 5, longitude: 6 },
      ],
    });
    expect(invalidate).toHaveBeenCalledWith(['reference-data', 'dashboard']);
  });
});

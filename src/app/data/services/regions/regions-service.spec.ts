import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { RegionsService } from './regions-service';

describe('RegionsService', () => {
  let service: RegionsService;
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RegionsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom, rpc: mockRpc }) as Partial<SupabaseClient> as SupabaseClient
          }
        }
      ]
    });

    service = TestBed.inject(RegionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll should query all regions ordered by name', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.findAll();
    const cachedResult = await service.findAll();

    expect(mockFrom).toHaveBeenCalledWith('regions');
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(order).toHaveBeenCalledWith('region', { ascending: true });
    expect(result).toBe(mockResponse);
    expect(cachedResult).toBe(mockResponse);
  });

  it('findById should query a single region by id', async () => {
    const mockResponse = { data: { id: 'region-1' }, error: null };
    const single = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.findById('region-1');

    expect(eq).toHaveBeenCalledWith('id', 'region-1');
    expect(single).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });

  it('findByZoneId should call the ordered zone regions rpc', async () => {
    const mockResponse = {
      data: [
        {
          id: 'region-1',
          latitude: -23.5,
          longitude: -46.6,
          order: 1,
          region: 'North',
          zone_id: 'zone-1',
        },
      ],
      error: null,
    };
    mockRpc.mockResolvedValue(mockResponse);

    const result = await service.findByZoneId('zone-1');

    expect(mockRpc).toHaveBeenCalledWith('get_zone_regions', {
      p_zone_id: 'zone-1',
    });
    expect(result.data?.[0].order).toBe(1);
  });
});

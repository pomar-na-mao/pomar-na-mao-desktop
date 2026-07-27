import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { ZonesService } from './zones-service';

describe('ZonesService', () => {
  let service: ZonesService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        ZonesService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }) as Partial<SupabaseClient> as SupabaseClient
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
});

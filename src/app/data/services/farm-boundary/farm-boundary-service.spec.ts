import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';
import { FarmBoundaryService } from './farm-boundary-service';

describe('FarmBoundaryService', () => {
  let service: FarmBoundaryService;
  let requestCache: SupabaseRequestCacheService;
  const from = vi.fn();
  const rpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        FarmBoundaryService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () =>
              ({ from, rpc }) as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(FarmBoundaryService);
    requestCache = TestBed.inject(SupabaseRequestCacheService);
  });

  it('should load and normalize rows in ascending order', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [
        { id: 'second', latitude: -23.2, longitude: -49.2, order: 2 },
        { id: 'first', latitude: -23.1, longitude: -49.1, order: 1 },
      ],
      error: null,
    });
    const select = vi.fn().mockReturnValue({ order });
    from.mockReturnValue({ select });

    const result = await service.getBoundary();

    expect(from).toHaveBeenCalledWith('farm');
    expect(order).toHaveBeenCalledWith('order', { ascending: true });
    expect(result.map((point) => point.id)).toEqual(['first', 'second']);
  });

  it('should preserve point order in the RPC and invalidate caches on success', async () => {
    const points = [
      { latitude: -23.3, longitude: -49.3 },
      { latitude: -23.1, longitude: -49.1 },
      { latitude: -23.2, longitude: -49.2 },
    ];
    rpc.mockResolvedValue({ data: 3, error: null });
    const invalidate = vi.spyOn(requestCache, 'invalidate');

    await expect(service.replaceBoundary(points)).resolves.toBe(3);

    expect(rpc).toHaveBeenCalledWith('replace_farm_boundary', {
      p_points: points,
    });
    expect(invalidate).toHaveBeenCalledWith([
      SUPABASE_CACHE_NAMESPACES.referenceData,
      SUPABASE_CACHE_NAMESPACES.overview,
    ]);
  });

  it('should propagate RPC errors without invalidating caches', async () => {
    const error = { message: 'replacement failed' };
    rpc.mockResolvedValue({ data: null, error });
    const invalidate = vi.spyOn(requestCache, 'invalidate');

    await expect(
      service.replaceBoundary([
        { latitude: -23.1, longitude: -49.1 },
        { latitude: -23.2, longitude: -49.2 },
        { latitude: -23.3, longitude: -49.3 },
      ]),
    ).rejects.toBe(error);
    expect(invalidate).not.toHaveBeenCalled();
  });
});

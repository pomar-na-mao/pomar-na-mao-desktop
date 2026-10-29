import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { MachinesService } from './machines.service';

describe('MachinesService', () => {
  let service: MachinesService;
  const from = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T10:00:00.000Z'));
    TestBed.configureTestingModule({
      providers: [
        MachinesService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () =>
              ({ from }) as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });
    service = TestBed.inject(MachinesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads machines ordered by name and caches the result', async () => {
    const response = {
      data: [],
      error: null,
      count: 0,
      status: 200,
      statusText: 'OK',
    };
    const order = vi.fn().mockResolvedValue(response);
    const select = vi.fn().mockReturnValue({ order });
    from.mockReturnValue({ select });

    const first = await service.findAll();
    const cached = await service.findAll();

    expect(from).toHaveBeenCalledWith('machines');
    expect(from).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith(
      'id, name, brand, acquisition_date, manufacturing_year, quantity, observations, created_at, updated_at',
      { count: 'exact' },
    );
    expect(order).toHaveBeenCalledWith('name', { ascending: true });
    expect(first).toBe(response);
    expect(cached).toBe(response);
  });

  it('creates a machine and invalidates the cache', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 'm-1', name: 'Trator' },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    from.mockReturnValue({ insert });

    const cache = TestBed.inject(SupabaseRequestCacheService);
    const invalidateSpy = vi.spyOn(cache, 'invalidate');

    const result = await service.create({
      name: 'Trator',
      brand: 'Valtra',
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
    });

    expect(from).toHaveBeenCalledWith('machines');
    expect(insert).toHaveBeenCalledWith({
      name: 'Trator',
      brand: 'Valtra',
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 1,
      observations: null,
      created_at: '2026-10-29T10:00:00.000Z',
      updated_at: '2026-10-29T10:00:00.000Z',
    });
    expect(invalidateSpy).toHaveBeenCalled();
    expect(result.data?.id).toBe('m-1');
  });

  it('updates a machine and invalidates cache', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: 'm-1', name: 'Trator Atualizado' },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    from.mockReturnValue({ update });

    const cache = TestBed.inject(SupabaseRequestCacheService);
    const invalidateSpy = vi.spyOn(cache, 'invalidate');

    const result = await service.update('m-1', {
      name: 'Trator Atualizado',
      brand: 'Valtra',
      acquisition_date: null,
      manufacturing_year: null,
      quantity: 2,
      observations: 'Novo',
    });

    expect(from).toHaveBeenCalledWith('machines');
    expect(eq).toHaveBeenCalledWith('id', 'm-1');
    expect(invalidateSpy).toHaveBeenCalled();
    expect(result.data?.name).toBe('Trator Atualizado');
  });

  it('deletes multiple machines and invalidates cache', async () => {
    const inFn = vi.fn().mockResolvedValue({ data: null, error: null });
    const del = vi.fn().mockReturnValue({ in: inFn });
    from.mockReturnValue({ delete: del });

    const cache = TestBed.inject(SupabaseRequestCacheService);
    const invalidateSpy = vi.spyOn(cache, 'invalidate');

    const result = await service.deleteMany(['m-1', 'm-2']);

    expect(from).toHaveBeenCalledWith('machines');
    expect(inFn).toHaveBeenCalledWith('id', ['m-1', 'm-2']);
    expect(invalidateSpy).toHaveBeenCalled();
    expect(result.error).toBeNull();
  });
});

import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { VarietiesService } from './varieties-service';

describe('VarietiesService', () => {
  let service: VarietiesService;
  const from = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T14:30:00.000Z'));
    TestBed.configureTestingModule({
      providers: [
        VarietiesService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () =>
              ({ from }) as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });
    service = TestBed.inject(VarietiesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads varieties ordered by most recent update and caches the result', async () => {
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

    expect(from).toHaveBeenCalledWith('varieties');
    expect(from).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith(
      'id, name, description, created_at, updated_at',
      { count: 'exact' },
    );
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(first).toBe(response);
    expect(cached).toBe(response);
  });

  it('creates a variety and invalidates related reads', async () => {
    const response = { data: { id: 1, name: 'Hass' }, error: null };
    const single = vi.fn().mockResolvedValue(response);
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    from.mockReturnValue({ insert });
    const invalidate = vi.spyOn(
      TestBed.inject(SupabaseRequestCacheService),
      'invalidate',
    );

    const result = await service.create({ name: 'Hass', description: null });

    expect(insert).toHaveBeenCalledWith([
      {
        name: 'Hass',
        description: null,
        created_at: '2026-10-20T14:30:00.000Z',
        updated_at: '2026-10-20T14:30:00.000Z',
      },
    ]);
    expect(result).toBe(response);
    expect(invalidate).toHaveBeenCalledWith([
      'reference-data',
      'overview',
      'plants',
    ]);
  });

  it('updates by id and returns the persisted row', async () => {
    const response = { data: { id: 2, name: 'Breda' }, error: null };
    const single = vi.fn().mockResolvedValue(response);
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    from.mockReturnValue({ update });

    const result = await service.update(2, {
      name: 'Breda',
      description: 'Atualizada',
    });

    expect(update).toHaveBeenCalledWith({
      name: 'Breda',
      description: 'Atualizada',
      updated_at: '2026-10-20T14:30:00.000Z',
    });
    expect(eq).toHaveBeenCalledWith('id', 2);
    expect(result).toBe(response);
  });

  it('deletes all selected ids in one request', async () => {
    const response = { data: null, error: null };
    const inFilter = vi.fn().mockResolvedValue(response);
    const deleteQuery = vi.fn().mockReturnValue({ in: inFilter });
    from.mockReturnValue({ delete: deleteQuery });

    const result = await service.deleteMany([1, 3]);

    expect(inFilter).toHaveBeenCalledWith('id', [1, 3]);
    expect(result).toBe(response);
  });

  it('does not invalidate reads when a mutation fails', async () => {
    const response = { data: null, error: { message: 'failed' } };
    const single = vi.fn().mockResolvedValue(response);
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    from.mockReturnValue({ insert });
    const invalidate = vi.spyOn(
      TestBed.inject(SupabaseRequestCacheService),
      'invalidate',
    );

    await service.create({ name: 'Falha', description: null });

    expect(invalidate).not.toHaveBeenCalled();
  });
});

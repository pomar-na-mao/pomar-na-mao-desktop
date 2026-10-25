import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { OccurrenceTypesService } from './occurrence-types.service';

describe('OccurrenceTypesService', () => {
  let service: OccurrenceTypesService;
  const from = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-20T14:30:00.000Z'));
    TestBed.configureTestingModule({
      providers: [
        OccurrenceTypesService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () =>
              ({ from }) as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });
    service = TestBed.inject(OccurrenceTypesService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads occurrence types ordered by most recent update and caches the result', async () => {
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

    expect(from).toHaveBeenCalledWith('occurrence_types');
    expect(from).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith(
      'id, name, code, category, created_at, updated_at',
      { count: 'exact' },
    );
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(first).toBe(response);
    expect(cached).toBe(response);
  });

  it('creates an occurrence type with matching timestamps and invalidates reads', async () => {
    const response = { data: { id: 'id-1', name: 'Ácaros' }, error: null };
    const single = vi.fn().mockResolvedValue(response);
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    from.mockReturnValue({ insert });
    const invalidate = vi.spyOn(
      TestBed.inject(SupabaseRequestCacheService),
      'invalidate',
    );

    const result = await service.create({
      name: 'Ácaros',
      code: 'mites',
      category: 'PEST_DISEASE',
    });

    expect(insert).toHaveBeenCalledWith([
      {
        name: 'Ácaros',
        code: 'mites',
        category: 'PEST_DISEASE',
        created_at: '2026-10-20T14:30:00.000Z',
        updated_at: '2026-10-20T14:30:00.000Z',
      },
    ]);
    expect(result).toBe(response);
    expect(invalidate).toHaveBeenCalledWith([
      'reference-data',
      'overview',
      'occurrences',
      'operations',
    ]);
  });

  it('updates by UUID without changing created_at', async () => {
    const response = { data: { id: 'id-2', name: 'Tripes' }, error: null };
    const single = vi.fn().mockResolvedValue(response);
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    from.mockReturnValue({ update });

    const result = await service.update('id-2', {
      name: 'Tripes',
      code: 'thrips',
      category: 'PEST_DISEASE',
    });

    expect(update).toHaveBeenCalledWith({
      name: 'Tripes',
      code: 'thrips',
      category: 'PEST_DISEASE',
      updated_at: '2026-10-20T14:30:00.000Z',
    });
    expect(update.mock.calls[0][0]).not.toHaveProperty('created_at');
    expect(eq).toHaveBeenCalledWith('id', 'id-2');
    expect(result).toBe(response);
  });

  it('deletes all selected UUIDs in one request', async () => {
    const response = { data: null, error: null };
    const inFilter = vi.fn().mockResolvedValue(response);
    const deleteQuery = vi.fn().mockReturnValue({ in: inFilter });
    from.mockReturnValue({ delete: deleteQuery });

    const result = await service.deleteMany(['id-1', 'id-3']);

    expect(inFilter).toHaveBeenCalledWith('id', ['id-1', 'id-3']);
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

    await service.create({
      name: 'Falha',
      code: 'failed',
      category: 'ANTHROPIC',
    });

    expect(invalidate).not.toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { OperationsService } from './operations-service';

describe('OperationsService', () => {
  let service: OperationsService;
  const rpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        OperationsService,
        {
          provide: SupabaseService,
          useValue: {
            supabase: { rpc } as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });
    service = TestBed.inject(OperationsService);
  });

  it('should reuse equivalent spraying filters during the TTL window', async () => {
    rpc.mockResolvedValue({
      data: [{ operation_id: 'op-1' }],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    });

    const first = await service.getSprayingOperations(
      '2026-07-01',
      '2026-07-25',
      'zone-1',
    );
    const second = await service.getSprayingOperations(
      '2026-07-01',
      '2026-07-25',
      'zone-1',
    );

    expect(first).toEqual(second);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it('should issue separate calls for different operation filters', async () => {
    rpc.mockResolvedValue({
      data: [],
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    });

    await service.getInspectionOperations(null, null, 'zone-1');
    await service.getInspectionOperations(null, null, 'zone-2');

    expect(rpc).toHaveBeenCalledTimes(2);
  });
});

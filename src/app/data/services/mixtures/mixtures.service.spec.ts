import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { MixturesService } from './mixtures.service';
import type { MixtureDraft } from '../../../domain/models/mixture.model';

describe('MixturesService', () => {
  let service: MixturesService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        MixturesService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () =>
              ({ from: mockFrom }) as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(MixturesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll should query mixtures and return response', async () => {
    const mockResponse = { data: [], error: null, count: 0 };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.findAll();

    expect(mockFrom).toHaveBeenCalledWith('mixtures');
    expect(select).toHaveBeenCalledWith('*, inputs:mixture_inputs(*, input:inputs(*))', { count: 'exact' });
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(result).toBe(mockResponse);
  });

  it('create should insert mixture and its inputs', async () => {
    const payload: MixtureDraft = {
      name: 'Calda Teste',
      registered_by_name: 'Admin',
      registered_by_email: 'admin@test.com',
      is_active: true,
      observations: 'Recomendação técnica',
      inputs: [
        {
          input_id: 'input-1',
          dose: '100',
          dose_unit: 'ml/100L',
        },
      ],
    };

    const createdMixture = { id: 'mixture-1', ...payload };

    // 1. insert mixture
    const singleInsert = vi.fn().mockResolvedValue({ data: createdMixture, error: null });
    const selectInsert = vi.fn().mockReturnValue({ single: singleInsert });
    const insertMixture = vi.fn().mockReturnValue({ select: selectInsert });

    // 2. insert mixture_inputs
    const insertInputs = vi.fn().mockResolvedValue({ data: null, error: null });

    // 3. fetch full mixture
    const singleFetch = vi.fn().mockResolvedValue({ data: { ...createdMixture, inputs: [] }, error: null });
    const eqFetch = vi.fn().mockReturnValue({ single: singleFetch });
    const selectFetch = vi.fn().mockReturnValue({ eq: eqFetch });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'mixtures') {
        return {
          insert: insertMixture,
          select: selectFetch,
        };
      }
      if (table === 'mixture_inputs') {
        return {
          insert: insertInputs,
        };
      }
      return {};
    });

    const result = await service.create(payload);

    expect(result.error).toBeNull();
    expect(result.data).toBeTruthy();
    expect(mockFrom).toHaveBeenCalledWith('mixtures');
    expect(mockFrom).toHaveBeenCalledWith('mixture_inputs');
  });

  it('deleteMany should delete mixtures by id list', async () => {
    const mockResponse = { data: null, error: null };
    const inFn = vi.fn().mockResolvedValue(mockResponse);
    const deleteFn = vi.fn().mockReturnValue({ in: inFn });
    mockFrom.mockReturnValue({ delete: deleteFn });

    const result = await service.deleteMany(['mixture-1', 'mixture-2']);

    expect(mockFrom).toHaveBeenCalledWith('mixtures');
    expect(deleteFn).toHaveBeenCalled();
    expect(inFn).toHaveBeenCalledWith('id', ['mixture-1', 'mixture-2']);
    expect(result).toBe(mockResponse);
  });
});

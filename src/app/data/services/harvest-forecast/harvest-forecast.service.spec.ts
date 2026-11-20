import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_HARVEST_WEIGHTS,
  type HarvestForecastSnapshot,
} from '../../../domain/models/harvest-forecast.model';
import { SupabaseService } from '../supabase';
import {
  HarvestForecastService,
  isHarvestForecastConflict,
} from './harvest-forecast.service';

const snapshot: HarvestForecastSnapshot = {
  year: 2026,
  years: [2026],
  zones: [],
  matched_count: 0,
  total_plants: 10,
  class_counts: { N: 0, P: 0, M: 0, G: 0, GG: 0 },
  forecast_kg: 0,
  markers: [],
};

describe('HarvestForecastService', () => {
  const rpc = vi.fn();
  let service: HarvestForecastService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        HarvestForecastService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ rpc }) as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });
    service = TestBed.inject(HarvestForecastService);
  });

  it('calls the snapshot RPC with typed optional arguments', async () => {
    rpc.mockResolvedValue({ data: snapshot, error: null });

    await expect(
      service.getSnapshot({
        year: 2026,
        classification: 'TODAS',
        zoneId: '',
        scenario: 'OTIMISTA',
        weights: DEFAULT_HARVEST_WEIGHTS,
      }),
    ).resolves.toBe(snapshot);

    expect(rpc).toHaveBeenCalledWith('get_harvest_forecast', {
      p_year: 2026,
      p_classification: null,
      p_zone_id: null,
      p_scenario: 'OTIMISTA',
      p_weights: DEFAULT_HARVEST_WEIGHTS,
    });
  });

  it('throws RPC and invalid response errors', async () => {
    const rpcError = { code: '22023', message: 'Inválido' };
    rpc.mockResolvedValueOnce({ data: null, error: rpcError });
    await expect(service.getSnapshot()).rejects.toBe(rpcError);

    rpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(service.getSnapshot()).rejects.toThrow('resposta inválida');
  });

  it('passes the exact updated_at string to the edit RPC', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'forecast-1',
        classification: 'GG',
        updated_at: '2026-11-20T12:00:00.123456+00:00',
      },
      error: null,
    });
    rpc.mockReturnValue({ single });

    await service.updateClassification({
      id: 'forecast-1',
      classification: 'GG',
      expectedUpdatedAt: '2026-11-20T10:00:00.654321+00:00',
    });

    expect(rpc).toHaveBeenCalledWith('update_harvest_forecast_classification', {
      p_id: 'forecast-1',
      p_classification: 'GG',
      p_expected_updated_at: '2026-11-20T10:00:00.654321+00:00',
    });
  });

  it('identifies optimistic concurrency conflicts', () => {
    expect(isHarvestForecastConflict({ code: 'P0002' })).toBe(true);
    expect(isHarvestForecastConflict({ code: '22023' })).toBe(false);
  });
});

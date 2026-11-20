import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { HarvestForecastService } from './harvest-forecast.service';

describe('HarvestForecastService', () => {
  const rpc = vi.fn();
  const read = vi.fn().mockImplementation((_options, loader) => loader());
  let service: HarvestForecastService;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        HarvestForecastService,
        { provide: SupabaseService, useValue: { getClient: () => ({ rpc }) } },
        { provide: SupabaseRequestCacheService, useValue: { read } },
      ],
    });
    service = TestBed.inject(HarvestForecastService);
  });

  it('omits empty optional parameters', async () => {
    rpc.mockResolvedValueOnce({ data: [], error: null });
    await service.findAll({ classifications: [] });
    expect(rpc).toHaveBeenCalledWith('get_harvest_forecasts', {});
  });

  it('maps all filters and builds a parameterized short-lived cache request', async () => {
    rpc.mockResolvedValueOnce({ data: [{ plant_id: 'p-1' }], error: null });
    const filters = {
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      classifications: ['P', 'GG'] as const,
      zoneId: 'zone-1',
    };
    await service.findAll({ ...filters, classifications: [...filters.classifications] });

    const args = {
      p_start_date: '2026-01-01',
      p_end_date: '2026-12-31',
      p_classifications: ['P', 'GG'],
      p_zone_id: 'zone-1',
    };
    expect(rpc).toHaveBeenCalledWith('get_harvest_forecasts', args);
    expect(read).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'harvestForecast.findAll',
        params: args,
        policy: { mode: 'ttl', ttlMs: 15_000 },
      }),
      expect.any(Function),
    );
  });

  it('returns RPC errors unchanged', async () => {
    const error = { code: '42501', message: 'denied', details: '', hint: '' };
    rpc.mockResolvedValueOnce({ data: null, error });
    await expect(service.findAll()).resolves.toMatchObject({ error });
  });
});

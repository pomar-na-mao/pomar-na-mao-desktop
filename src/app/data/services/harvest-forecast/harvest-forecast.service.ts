import { inject, Injectable } from '@angular/core';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type {
  HarvestForecastFilters,
  HarvestForecastItem,
} from '../../../domain/models/harvest-forecast.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

@Injectable({ providedIn: 'root' })
export class HarvestForecastService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(
    filters: HarvestForecastFilters = {},
  ): Promise<PostgrestResponse<HarvestForecastItem>> {
    const args: Record<string, unknown> = {};
    if (filters.startDate) args['p_start_date'] = filters.startDate;
    if (filters.endDate) args['p_end_date'] = filters.endDate;
    if (filters.classifications?.length) {
      args['p_classifications'] = filters.classifications;
    }
    if (filters.zoneId) args['p_zone_id'] = filters.zoneId;

    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.harvestForecasts,
        operation: 'harvestForecast.findAll',
        params: args,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      async () =>
        (await this.supabase.rpc(
          'get_harvest_forecasts',
          args,
        )) as unknown as PostgrestResponse<HarvestForecastItem>,
    );
  }
}

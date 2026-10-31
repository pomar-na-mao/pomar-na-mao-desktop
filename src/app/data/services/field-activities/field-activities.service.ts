import { inject, Injectable } from '@angular/core';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type { FieldActivityItem } from '../../../domain/models/field-activity.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export interface IFieldActivitiesService {
  getFieldActivities(
    startDate?: string | null,
    endDate?: string | null,
  ): Promise<PostgrestResponse<FieldActivityItem>>;
}

@Injectable({ providedIn: 'root' })
export class FieldActivitiesService implements IFieldActivitiesService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async getFieldActivities(
    startDate?: string | null,
    endDate?: string | null,
  ): Promise<PostgrestResponse<FieldActivityItem>> {
    const args: { p_start_date?: string; p_end_date?: string } = {};
    if (startDate) args.p_start_date = startDate;
    if (endDate) args.p_end_date = endDate;

    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.operations,
        operation: 'fieldActivities.getActivities',
        params: args,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      async () =>
        (await this.supabase.rpc(
          'get_field_activities',
          args,
        )) as unknown as PostgrestResponse<FieldActivityItem>,
    );
  }
}

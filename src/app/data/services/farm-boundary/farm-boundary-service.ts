import { inject, Injectable } from '@angular/core';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type { OrderedMapBoundaryPoint } from '../../../shared/utils/ordered-map-boundary';
import { normalizeOrderedBoundaryPoints } from '../../../shared/utils/ordered-map-boundary';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

type FarmBoundaryRow = {
  id?: string | null;
  latitude: number | null;
  longitude: number | null;
  order: number | null;
};

@Injectable({
  providedIn: 'root',
})
export class FarmBoundaryService {
  private supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async getBoundary(): Promise<OrderedMapBoundaryPoint[]> {
    const response = await this.requestCache.read<
      PostgrestResponse<FarmBoundaryRow>
    >(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'farmBoundary.getBoundary',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (value) => !value.error,
      },
      () =>
        this.supabase
          .from('farm')
          .select('id,latitude,longitude,order')
          .order('order', { ascending: true }),
    );

    if (response.error) {
      throw response.error;
    }

    return normalizeOrderedBoundaryPoints(response.data ?? []);
  }
}

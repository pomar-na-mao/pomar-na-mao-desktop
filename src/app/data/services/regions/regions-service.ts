import { inject, Injectable } from "@angular/core";
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type { Region } from "../../../domain/models/regions.model";
import { injectSupabase } from "../supabase";
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from "../supabase-request-cache/supabase-request-cache.service";

export interface IRegionsService {
  findAll(): Promise<PostgrestResponse<Region>>;
  findById(id: string): Promise<PostgrestSingleResponse<Region>>;
  findByZoneId(zoneId: string): Promise<PostgrestResponse<Region>>;
}

@Injectable({
  providedIn: 'root',
})
export class RegionsService implements IRegionsService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<Region>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'regions.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('regions')
          .select('*', { count: 'exact' })
          .order('region', { ascending: true }),
    );
  }

  public async findByZoneId(zoneId: string): Promise<PostgrestResponse<Region>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'regions.findByZoneId',
        params: { zoneId },
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      async () => {
        const response = await this.supabase.rpc('get_zone_regions', {
          p_zone_id: zoneId,
        });
        return response as PostgrestResponse<Region>;
      },
    );
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Region>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'regions.findById',
        params: { id },
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () => this.supabase.from('regions').select('*').eq('id', id).single(),
    );
  }
}


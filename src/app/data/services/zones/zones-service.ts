import { inject, Injectable } from "@angular/core";
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type { Zone } from "../../../domain/models/zone.model";
import { injectSupabase } from "../supabase";
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from "../supabase-request-cache/supabase-request-cache.service";

export interface IZonesService {
  findAll(): Promise<PostgrestResponse<Zone>>;
  findById(id: string): Promise<PostgrestSingleResponse<Zone>>;
}

@Injectable({
  providedIn: 'root',
})
export class ZonesService implements IZonesService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<Zone>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'zones.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('zones')
          .select('*', { count: 'exact' })
          .order('name', { ascending: true }),
    );
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Zone>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'zones.findById',
        params: { id },
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () => this.supabase.from('zones').select('*').eq('id', id).single(),
    );
  }
}

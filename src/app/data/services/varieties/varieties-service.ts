import { inject, Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import type {
  Variety,
  VarietyCreate,
  VarietyDraft,
  VarietyUpdate,
} from '../../../domain/models/variety.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export interface IVarietiesService {
  findAll(): Promise<PostgrestResponse<Variety>>;
  create(payload: VarietyDraft): Promise<PostgrestSingleResponse<Variety>>;
  update(
    id: number,
    payload: VarietyDraft,
  ): Promise<PostgrestSingleResponse<Variety>>;
  deleteMany(ids: number[]): Promise<PostgrestSingleResponse<null>>;
}

@Injectable({ providedIn: 'root' })
export class VarietiesService implements IVarietiesService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<Variety>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'varieties.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('varieties')
          .select('id, name, description, created_at, updated_at', {
            count: 'exact',
          })
          .order('name', { ascending: true }),
    ) as Promise<PostgrestResponse<Variety>>;
  }

  public async create(
    payload: VarietyDraft,
  ): Promise<PostgrestSingleResponse<Variety>> {
    const timestamp = new Date().toISOString();
    const persistedPayload: VarietyCreate = {
      ...payload,
      created_at: timestamp,
      updated_at: timestamp,
    };
    const response = (await this.supabase
      .from('varieties')
      .insert([persistedPayload])
      .select('id, name, description, created_at, updated_at')
      .single()) as PostgrestSingleResponse<Variety>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async update(
    id: number,
    payload: VarietyDraft,
  ): Promise<PostgrestSingleResponse<Variety>> {
    const persistedPayload: VarietyUpdate = {
      ...payload,
      updated_at: new Date().toISOString(),
    };
    const response = (await this.supabase
      .from('varieties')
      .update(persistedPayload)
      .eq('id', id)
      .select('id, name, description, created_at, updated_at')
      .single()) as PostgrestSingleResponse<Variety>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async deleteMany(
    ids: number[],
  ): Promise<PostgrestSingleResponse<null>> {
    const response = (await this.supabase
      .from('varieties')
      .delete()
      .in('id', ids)) as PostgrestSingleResponse<null>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  private invalidateReadsWhenSuccessful(error: unknown): void {
    if (error) return;

    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.referenceData,
      SUPABASE_CACHE_NAMESPACES.dashboard,
      SUPABASE_CACHE_NAMESPACES.plants,
    ]);
  }
}

import { inject, Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import type {
  OccurrenceType,
  OccurrenceTypeCreate,
  OccurrenceTypeDraft,
  OccurrenceTypeUpdate,
} from '../../../domain/models/occurrence-type.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export interface IOccurrenceTypesService {
  findAll(): Promise<PostgrestResponse<OccurrenceType>>;
  create(
    payload: OccurrenceTypeDraft,
  ): Promise<PostgrestSingleResponse<OccurrenceType>>;
  update(
    id: string,
    payload: OccurrenceTypeDraft,
  ): Promise<PostgrestSingleResponse<OccurrenceType>>;
  deleteMany(ids: string[]): Promise<PostgrestSingleResponse<null>>;
}

@Injectable({ providedIn: 'root' })
export class OccurrenceTypesService implements IOccurrenceTypesService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<OccurrenceType>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'occurrenceTypes.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('occurrence_types')
          .select('id, name, code, category, created_at, updated_at', {
            count: 'exact',
          })
          .order('updated_at', { ascending: false }),
    ) as Promise<PostgrestResponse<OccurrenceType>>;
  }

  public async create(
    payload: OccurrenceTypeDraft,
  ): Promise<PostgrestSingleResponse<OccurrenceType>> {
    const timestamp = new Date().toISOString();
    const persistedPayload: OccurrenceTypeCreate = {
      ...payload,
      created_at: timestamp,
      updated_at: timestamp,
    };
    const response = (await this.supabase
      .from('occurrence_types')
      .insert([persistedPayload])
      .select('id, name, code, category, created_at, updated_at')
      .single()) as PostgrestSingleResponse<OccurrenceType>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async update(
    id: string,
    payload: OccurrenceTypeDraft,
  ): Promise<PostgrestSingleResponse<OccurrenceType>> {
    const persistedPayload: OccurrenceTypeUpdate = {
      ...payload,
      updated_at: new Date().toISOString(),
    };
    const response = (await this.supabase
      .from('occurrence_types')
      .update(persistedPayload)
      .eq('id', id)
      .select('id, name, code, category, created_at, updated_at')
      .single()) as PostgrestSingleResponse<OccurrenceType>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async deleteMany(
    ids: string[],
  ): Promise<PostgrestSingleResponse<null>> {
    const response = (await this.supabase
      .from('occurrence_types')
      .delete()
      .in('id', ids)) as PostgrestSingleResponse<null>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  private invalidateReadsWhenSuccessful(error: unknown): void {
    if (error) return;

    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.referenceData,
      SUPABASE_CACHE_NAMESPACES.overview,
      SUPABASE_CACHE_NAMESPACES.occurrences,
      SUPABASE_CACHE_NAMESPACES.operations,
    ]);
  }
}

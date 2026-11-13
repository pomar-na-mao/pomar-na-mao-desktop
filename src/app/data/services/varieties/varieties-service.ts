import { inject, Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import type {
  AssignVarietyToPlantsPayload,
  AssignVarietyToPlantsResult,
  CreateVarietyWithPlantsPayload,
  CreateVarietyWithPlantsResult,
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
  createWithPlants(
    payload: CreateVarietyWithPlantsPayload,
  ): Promise<{ data: CreateVarietyWithPlantsResult | null; error: unknown }>;
  assignToPlants(
    payload: AssignVarietyToPlantsPayload,
  ): Promise<{ data: AssignVarietyToPlantsResult | null; error: unknown }>;
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
          .order('updated_at', { ascending: false }),
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

  public async createWithPlants(
    payload: CreateVarietyWithPlantsPayload,
  ): Promise<{ data: CreateVarietyWithPlantsResult | null; error: unknown }> {
    const { data, error } = await this.supabase.rpc(
      'create_variety_with_plants',
      {
        p_name: payload.name,
        p_description: payload.description ?? null,
        p_polygon_geojson: payload.polygonGeojson as unknown as never,
      },
    );

    if (error) {
      return { data: null, error };
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | {
          variety_id: number | string;
          variety_name: string;
          variety_description: string | null;
          created_at: string;
          updated_at: string;
          plants_updated_count: number;
        }
      | null
      | undefined;

    if (!row) {
      return {
        data: null,
        error: new Error('Nenhum dado retornado ao criar variedade com plantas.'),
      };
    }

    const result: CreateVarietyWithPlantsResult = {
      variety: {
        id: Number(row.variety_id),
        name: String(row.variety_name),
        description: (row.variety_description ?? null) as string | null,
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      },
      plants_updated_count: Number(row.plants_updated_count ?? 0),
    };

    this.invalidateReadsWhenSuccessful(null);
    return { data: result, error: null };
  }

  public async assignToPlants(
    payload: AssignVarietyToPlantsPayload,
  ): Promise<{ data: AssignVarietyToPlantsResult | null; error: unknown }> {
    const { data, error } = await this.supabase.rpc(
      'assign_variety_to_plants',
      {
        p_variety_id: payload.varietyId,
        p_polygon_geojson: payload.polygonGeojson as unknown as never,
      },
    );

    if (error) {
      return { data: null, error };
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | {
          variety_id: number | string;
          variety_name: string;
          plants_updated_count: number;
        }
      | null
      | undefined;

    if (!row) {
      return {
        data: null,
        error: new Error('Nenhum dado retornado ao atribuir variedade às plantas.'),
      };
    }

    const result: AssignVarietyToPlantsResult = {
      variety_id: Number(row.variety_id),
      variety_name: String(row.variety_name),
      plants_updated_count: Number(row.plants_updated_count ?? 0),
    };

    this.invalidateReadsWhenSuccessful(null);
    return { data: result, error: null };
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
      SUPABASE_CACHE_NAMESPACES.overview,
      SUPABASE_CACHE_NAMESPACES.plants,
    ]);
  }
}

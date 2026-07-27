
import { inject, Injectable } from "@angular/core";
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Plant, PlantInsert } from "../../../domain/models/plant-data.model";
import { injectSupabase } from "../supabase";
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from "../supabase-request-cache/supabase-request-cache.service";

export type PlantsFilter = {
  region?: string;
  zoneId?: string;
  occurrence?: string;
  variety?: string;
}

export interface IPlantsService {
  findAll(filters: PlantsFilter | null): Promise<PostgrestSingleResponse<Plant[]>>;
  findById(id: string): Promise<PostgrestSingleResponse<Plant>>;
  delete(id: string): Promise<PostgrestSingleResponse<null>>;
  insert(plant: PlantInsert): Promise<PostgrestSingleResponse<Plant>>;
  getTotalCount(): Promise<number>;
  getAliveCount(): Promise<number>;
  getUpdatedCount(): Promise<number>;
  getLatestUpdatedAt(): Promise<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class PlantsService implements IPlantsService {

  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(filters: PlantsFilter | null): Promise<PostgrestSingleResponse<Plant[]>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plants,
        operation: 'plants.findAll',
        params: filters,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      async () => {
        let query = this.supabase.from('plants').select('*').order('created_at', { ascending: false });

        if (filters) {
          const { region, zoneId, occurrence, variety } = filters;

          if (region) {
            query = query.eq('region', region);
          }

          if (zoneId) {
            query = query.eq('zone_id', zoneId);
          }

          if (occurrence) {
            query = query.eq(occurrence, true);
          }

          if (variety) {
            query = query.eq('variety', variety);
          }
        }
        return await query;
      },
    );
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Plant>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plants,
        operation: 'plants.findById',
        params: { id },
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      () => this.supabase.from('plants').select('*').eq('id', id).single(),
    );
  }

  public async delete(id: string): Promise<PostgrestSingleResponse<null>> {
    const response = await this.supabase.from('plants').delete().eq('id', id);
    if (!response.error) {
      this.invalidatePlantReads();
    }
    return response;
  }

  public async insert(plant: PlantInsert): Promise<PostgrestSingleResponse<Plant>> {
    const response = await this.supabase.from('plants').insert([plant]).select().single();
    if (!response.error) {
      this.invalidatePlantReads();
    }
    return response;
  }

  public async getTotalCount(): Promise<number> {
    return this.readPlantCounter('plants.totalCount', async () => {
      const { count, error } = await this.supabase.from('plants').select('*', { count: 'exact', head: true });
      return { value: error ? 0 : (count || 0), error };
    });
  }

  public async getAliveCount(): Promise<number> {
    return this.readPlantCounter('plants.aliveCount', async () => {
      const { count, error } = await this.supabase.from('plants').select('*', { count: 'exact', head: true }).eq('is_dead', false);
      return { value: error ? 0 : (count || 0), error };
    });
  }

  public async getUpdatedCount(): Promise<number> {
    return this.readPlantCounter('plants.updatedCount', async () => {
      const { count, error } = await this.supabase.from('plants').select('*', { count: 'exact', head: true }).not('updated_at', 'is', null);
      return { value: error ? 0 : (count || 0), error };
    });
  }

  public async getLatestUpdatedAt(): Promise<string | null> {
    return this.readPlantCounter('plants.latestUpdatedAt', async () => {
      const { data, error } = await this.supabase
        .from('plants')
        .select('updated_at')
        .not('updated_at', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return { value: error ? null : data?.updated_at, error };
    });
  }

  private async readPlantCounter<T>(
    operation: string,
    loader: () => Promise<{ value: T; error: unknown }>,
  ): Promise<T> {
    const result = await this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plantCounters,
        operation,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      loader,
    );
    return result.value;
  }

  private invalidatePlantReads(): void {
    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.plants,
      SUPABASE_CACHE_NAMESPACES.plantCounters,
      SUPABASE_CACHE_NAMESPACES.dashboard,
      SUPABASE_CACHE_NAMESPACES.operations,
      SUPABASE_CACHE_NAMESPACES.occurrences,
    ]);
  }
}

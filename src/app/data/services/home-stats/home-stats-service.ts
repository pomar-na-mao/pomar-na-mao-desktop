import { inject, Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { PlantRecentUpdate } from "../../../domain/models/plant-data.model";
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from "../supabase-request-cache/supabase-request-cache.service";

export interface HomeStats {
  total_plants: number;
  alive_plants: number;
  updated_plants: number;
  latest_updated_at: string | null;
  total_spraying_sessions: number;
  total_new_plants: number;
}

export interface IHomeStatsService {
  getHomeStats(): Promise<HomeStats>;
  getRecentUpdates(): Promise<PlantRecentUpdate[]>;
}

@Injectable({
  providedIn: 'root',
})
export class HomeStatsService implements IHomeStatsService {
  private supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async getHomeStats(): Promise<HomeStats> {
    return this.requestCache.read(
      {
        namespace: [
          SUPABASE_CACHE_NAMESPACES.dashboard,
          SUPABASE_CACHE_NAMESPACES.plantCounters,
        ],
        operation: 'homeStats.getHomeStats',
        policy: { mode: 'ttl', ttlMs: 15_000 },
      },
      async () => {
        const { data, error } = await this.supabase.functions.invoke<{ status: string; data: HomeStats }>(
          'get-home-stats'
        );

        if (error || !data || data.status !== 'ok') {
          const msg = error?.message || data?.status || 'Unknown error';
          throw new Error(msg);
        }

        return data.data;
      },
    );
  }

  public async getRecentUpdates(): Promise<PlantRecentUpdate[]> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plants,
        operation: 'homeStats.getRecentUpdates',
        policy: { mode: 'ttl', ttlMs: 15_000 },
      },
      async () => {
        const { data, error } = await this.supabase
          .from('plants')
          .select('id, variety, region, updated_at, stick, broken_branch, vine_growing, burnt_branch, struck_by_lightning, drill, anthill, in_experiment, weeds_in_the_basin, fertilization_or_manuring, mites, thrips, empty_collection_box_near, is_new, non_existent, frost, flowers, buds, dehydrated, is_dead')
          .not('updated_at', 'is', null)
          .order('updated_at', { ascending: false })
          .limit(10);

        if (error) {
          throw error;
        }

        return (data as PlantRecentUpdate[]) || [];
      },
    );
  }
}

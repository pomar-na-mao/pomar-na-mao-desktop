import { inject, Injectable } from '@angular/core';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';
import type { GeoJsonPolygon } from '../../../domain/models/mass-inclusion';
import type {
  AssignZonePayload,
  AssignZoneResult,
  ZoneAssignmentPlant,
  ZoneAssignmentPreviewPlant,
} from '../../../domain/models/zone-assignment.model';

interface PlantInsidePolygonRow {
  plant_id: string;
  latitude: number;
  longitude: number;
  zone_id: string | null;
  zone_name: string | null;
  variety_id: number | null;
  variety_name: string | null;
  planting_date: string | null;
}

interface AssignZoneResultRow {
  zone_id: string;
  zone_name: string;
  plants_updated_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class ZoneAssignmentService {
  private supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async getAllPlantsForMap(): Promise<{
    data: ZoneAssignmentPlant[] | null;
    error: unknown;
  }> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plants,
        operation: 'zoneAssignment.getAllPlantsForMap',
        policy: { mode: 'ttl', ttlMs: 30_000 },
      },
      async () => {
        const { data, error } = await this.supabase.rpc('get_all_plants_for_map');
        if (error) {
          return { data: null, error };
        }

        const plants = (data ?? []) as ZoneAssignmentPlant[];
        return { data: plants, error: null };
      },
    );
  }

  public async findPlantsInsidePolygon(
    polygonGeojson: GeoJsonPolygon,
  ): Promise<{ data: ZoneAssignmentPreviewPlant[] | null; error: unknown }> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plants,
        operation: 'zoneAssignment.findPlantsInsidePolygon',
        params: polygonGeojson,
        policy: { mode: 'dedupe-only' },
      },
      async () => {
        const { data, error } = await this.supabase.rpc(
          'find_plants_inside_polygon',
          {
            p_polygon_geojson: polygonGeojson as unknown as never,
          },
        );

        if (error) {
          return { data: null, error };
        }

        const rows = (data ?? []) as PlantInsidePolygonRow[];
        const mapped: ZoneAssignmentPreviewPlant[] = rows.map((row) => ({
          plantId: row.plant_id,
          latitude: row.latitude,
          longitude: row.longitude,
          zoneId: row.zone_id,
          zoneName: row.zone_name,
          varietyId: row.variety_id,
          varietyName: row.variety_name,
          plantingDate: row.planting_date,
          selected: true,
        }));

        return { data: mapped, error: null };
      },
    );
  }

  public async assignPlantsToZone(
    payload: AssignZonePayload,
  ): Promise<{ data: AssignZoneResult | null; error: unknown }> {
    const { data, error } = await this.supabase.rpc('assign_plants_to_zone', {
      p_zone_id: payload.zoneId,
      p_plant_ids: payload.plantIds,
    });

    if (error) {
      return { data: null, error };
    }

    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.plants,
      SUPABASE_CACHE_NAMESPACES.plantCounters,
      SUPABASE_CACHE_NAMESPACES.dashboard,
      SUPABASE_CACHE_NAMESPACES.operations,
    ]);

    const result = data as AssignZoneResultRow | null | undefined;
    return {
      data: result
        ? {
            zoneId: result.zone_id,
            zoneName: result.zone_name,
            plantsUpdatedCount: result.plants_updated_count,
          }
        : null,
      error: null,
    };
  }
}

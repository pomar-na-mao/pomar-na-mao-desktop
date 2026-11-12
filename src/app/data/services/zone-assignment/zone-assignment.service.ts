import { inject, Injectable } from '@angular/core';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';
import type { GeoJsonPolygon } from '../../../domain/models/basic-data';
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

        const rawPlants = (data ?? []) as Array<Record<string, unknown>>;
        const plants: ZoneAssignmentPlant[] = rawPlants.map((row) => {
          const zoneId = (row['zoneId'] ?? row['zone_id'] ?? null) as string | null;
          const varietyName = (row['varietyName'] ?? row['variety_name'] ?? null) as string | null;
          const varietyId =
            row['varietyId'] != null
              ? Number(row['varietyId'])
              : row['variety_id'] != null
                ? Number(row['variety_id'])
                : null;

          const plant: ZoneAssignmentPlant = {
            id: String(row['id']),
            latitude: Number(row['latitude']),
            longitude: Number(row['longitude']),
            zoneId,
          };

          if (varietyName) {
            plant.varietyName = varietyName;
          }
          if (varietyId != null) {
            plant.varietyId = varietyId;
            plant.variety_id = varietyId;
          }
          if (row['zone_id']) {
            plant.zone_id = String(row['zone_id']);
          }
          if (row['variety_name']) {
            plant.variety_name = String(row['variety_name']);
          }

          return plant;
        });
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
      SUPABASE_CACHE_NAMESPACES.overview,
      SUPABASE_CACHE_NAMESPACES.operations,
    ]);

    let plantsUpdatedCount = payload.plantIds.length;
    let zoneId = payload.zoneId;
    let zoneName = '';

    if (typeof data === 'number') {
      plantsUpdatedCount = data;
    } else if (typeof data === 'string' && !isNaN(Number(data))) {
      plantsUpdatedCount = Number(data);
    } else if (data && typeof data === 'object') {
      const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown>;
      const parsedCount = Number(
        row['plants_updated_count'] ?? row['plantsUpdatedCount']
      );
      if (!isNaN(parsedCount)) {
        plantsUpdatedCount = parsedCount;
      }
      zoneId = (row['zone_id'] ?? row['zoneId'] ?? payload.zoneId) as string;
      zoneName = (row['zone_name'] ?? row['zoneName'] ?? '') as string;
    }

    return {
      data: {
        zoneId,
        zoneName,
        plantsUpdatedCount,
      },
      error: null,
    };
  }
}

import { inject, Injectable } from '@angular/core';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';
import type {
  GeoJsonPolygon,
  BasicDataOccurrenceOption,
  BasicDataVarietyOption,
  PlantInsidePolygon,
  PolygonBulkUpdatePayload,
  PolygonBulkUpdateResult,
} from '../../../domain/models/basic-data';

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

interface PolygonBulkUpdateResultRow {
  field_operation_id: string;
  plants_changed_count: number;
  occurrences_created_count: number;
  occurrences_updated_count: number;
  attributes_updated_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class BasicDataService {
  private supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findPlantsInsidePolygon(
    polygonGeojson: GeoJsonPolygon
  ): Promise<{ data: PlantInsidePolygon[] | null; error: unknown }> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plants,
        operation: 'basicData.findPlantsInsidePolygon',
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

        return {
          data: ((data ?? []) as PlantInsidePolygonRow[]).map((row) => ({
            plantId: row.plant_id,
            latitude: row.latitude,
            longitude: row.longitude,
            zoneId: row.zone_id,
            zoneName: row.zone_name,
            varietyId: row.variety_id,
            varietyName: row.variety_name,
            plantingDate: row.planting_date,
          })),
          error: null,
        };
      },
    );
  }

  public async findVarietyOptions(): Promise<{ data: BasicDataVarietyOption[] | null; error: unknown }> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'basicData.varietyOptions',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      async () => {
        const { data, error } = await this.supabase
          .from('varieties')
          .select('id,name,description')
          .order('name');

        return {
          data: error ? null : (data as BasicDataVarietyOption[]),
          error,
        };
      },
    );
  }

  public async findOccurrenceTypeOptions(): Promise<{ data: BasicDataOccurrenceOption[] | null; error: unknown }> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'basicData.occurrenceTypeOptions',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      async () => {
        const { data, error } = await this.supabase
          .from('occurrence_types')
          .select('id,code,name')
          .order('name');

        return {
          data: error ? null : (data as BasicDataOccurrenceOption[]),
          error,
        };
      },
    );
  }

  public async syncPolygonBulkUpdate(
    payload: PolygonBulkUpdatePayload
  ): Promise<{ data: PolygonBulkUpdateResult | null; error: unknown }> {
    const { data, error } = await this.supabase.rpc('sync_polygon_bulk_update', {
      p_payload: payload as unknown as never,
    });

    if (error) {
      return { data: null, error };
    }

    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.plants,
      SUPABASE_CACHE_NAMESPACES.plantCounters,
      SUPABASE_CACHE_NAMESPACES.overview,
      SUPABASE_CACHE_NAMESPACES.operations,
      SUPABASE_CACHE_NAMESPACES.occurrences,
    ]);

    const row = (Array.isArray(data) ? data[0] : data) as PolygonBulkUpdateResultRow | null | undefined;

    return {
      data: row
        ? {
            fieldOperationId: row.field_operation_id,
            plantsChangedCount: row.plants_changed_count,
            occurrencesCreatedCount: row.occurrences_created_count,
            occurrencesUpdatedCount: row.occurrences_updated_count,
            attributesUpdatedCount: row.attributes_updated_count,
          }
        : null,
      error: null,
    };
  }
}

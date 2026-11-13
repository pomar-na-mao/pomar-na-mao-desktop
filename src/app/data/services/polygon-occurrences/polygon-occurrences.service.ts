import { inject, Injectable } from '@angular/core';
import type {
  PolygonOccurrenceGeoJson,
  PolygonOccurrenceOption,
  PolygonOccurrencePayload,
  PolygonOccurrencePreviewPlant,
  PolygonOccurrenceResult,
} from '../../../domain/models/polygon-occurrences';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

interface PreviewPlantRow {
  plant_id: string;
  latitude: number;
  longitude: number;
  zone_id: string | null;
  zone_name: string | null;
  variety_id: number | null;
  variety_name: string | null;
  planting_date: string | null;
}

interface PolygonOccurrenceResultRow {
  field_operation_id: string;
  plants_processed_count: number;
  plants_changed_count: number;
  occurrences_created_count: number;
  occurrences_resolved_count: number;
  occurrences_unchanged_count: number;
}

@Injectable({ providedIn: 'root' })
export class PolygonOccurrencesService {
  private supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findOccurrenceTypeOptions(): Promise<{
    data: PolygonOccurrenceOption[] | null;
    error: unknown;
  }> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'polygonOccurrences.occurrenceTypeOptions',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      async () => {
        const { data, error } = await this.supabase
          .from('occurrence_types')
          .select('id,code,name')
          .order('name');

        return {
          data: error ? null : (data as PolygonOccurrenceOption[]),
          error,
        };
      },
    );
  }

  public async findPlantsInsidePolygon(
    polygonGeojson: PolygonOccurrenceGeoJson,
  ): Promise<{ data: PolygonOccurrencePreviewPlant[] | null; error: unknown }> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.plants,
        operation: 'polygonOccurrences.findPlantsInsidePolygon',
        params: polygonGeojson,
        policy: { mode: 'dedupe-only' },
      },
      async () => {
        const { data, error } = await this.supabase.rpc(
          'find_plants_inside_polygon',
          { p_polygon_geojson: polygonGeojson as unknown as never },
        );

        if (error) return { data: null, error };

        return {
          data: ((data ?? []) as PreviewPlantRow[]).map((row) => ({
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

  public async syncPolygonOccurrences(
    payload: PolygonOccurrencePayload,
  ): Promise<{ data: PolygonOccurrenceResult | null; error: unknown }> {
    const { data, error } = await this.supabase.rpc('sync_polygon_occurrences', {
      p_payload: payload as unknown as never,
    });

    if (error) return { data: null, error };

    const row = (Array.isArray(data) ? data[0] : data) as
      | PolygonOccurrenceResultRow
      | null
      | undefined;

    if (!row) return { data: null, error: null };

    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.plants,
      SUPABASE_CACHE_NAMESPACES.plantCounters,
      SUPABASE_CACHE_NAMESPACES.overview,
      SUPABASE_CACHE_NAMESPACES.operations,
      SUPABASE_CACHE_NAMESPACES.occurrences,
    ]);

    return {
      data: {
        fieldOperationId: row.field_operation_id,
        plantsProcessedCount: row.plants_processed_count,
        plantsChangedCount: row.plants_changed_count,
        occurrencesCreatedCount: row.occurrences_created_count,
        occurrencesResolvedCount: row.occurrences_resolved_count,
        occurrencesUnchangedCount: row.occurrences_unchanged_count,
      },
      error: null,
    };
  }
}


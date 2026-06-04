import { Injectable } from '@angular/core';
import { injectSupabase } from '../supabase';
import type {
  GeoJsonPolygon,
  MassInclusionOccurrenceOption,
  MassInclusionVarietyOption,
  PlantInsidePolygon,
  PolygonBulkUpdatePayload,
  PolygonBulkUpdateResult,
} from '../../../domain/models/mass-inclusion';

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
export class MassInclusionService {
  private supabase = injectSupabase();

  public async findPlantsInsidePolygon(
    polygonGeojson: GeoJsonPolygon
  ): Promise<{ data: PlantInsidePolygon[] | null; error: unknown }> {
    const { data, error } = await this.supabase.rpc('find_plants_inside_polygon', {
      p_polygon_geojson: polygonGeojson as unknown as never,
    });

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
  }

  public async findVarietyOptions(): Promise<{ data: MassInclusionVarietyOption[] | null; error: unknown }> {
    const { data, error } = await this.supabase
      .from('varieties')
      .select('id,name,description')
      .order('name');

    return {
      data: error ? null : (data as MassInclusionVarietyOption[]),
      error,
    };
  }

  public async findOccurrenceTypeOptions(): Promise<{ data: MassInclusionOccurrenceOption[] | null; error: unknown }> {
    const { data, error } = await this.supabase
      .from('occurrence_types')
      .select('id,code,name')
      .order('name');

    return {
      data: error ? null : (data as MassInclusionOccurrenceOption[]),
      error,
    };
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

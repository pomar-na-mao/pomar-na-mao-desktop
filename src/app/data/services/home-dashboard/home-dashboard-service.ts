import { Injectable } from '@angular/core';
import { injectSupabase } from '../supabase';
import type {
  HomeDashboardFilterOptions,
  HomeDashboardOccurrence,
  HomeDashboardPlant,
  HomeDashboardSnapshot,
  HomeDashboardSnapshotFilters,
  HomeDashboardVariety,
  HomeDashboardZone,
} from '../../../domain/models/home-dashboard.model';

type VarietyRow = {
  id: number;
  name: string;
};

type PlantMapRow = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  varietyId: number | null;
  varietyName: string | null;
};

type SnapshotSummaryRow = {
  totalPlants?: number | null;
  totalZones?: number | null;
  totalOccurrenceTypes?: number | null;
  totalVarieties?: number | null;
  varieties?: VarietyRow[] | null;
};

type HomeDashboardSnapshotRow = {
  summary?: SnapshotSummaryRow | null;
  plants?: PlantMapRow[] | null;
};

type HomeDashboardSnapshotRpcParams = {
  p_period_start_date: string | null;
  p_period_end_date: string | null;
  p_planting_start_date: string | null;
  p_planting_end_date: string | null;
  p_operation_code: string | null;
};

const EMPTY_SNAPSHOT_FILTERS: HomeDashboardSnapshotFilters = {
  plantingStartDate: null,
  plantingEndDate: null,
};

@Injectable({
  providedIn: 'root',
})
export class HomeDashboardService {
  private supabase = injectSupabase();

  public async getSnapshot(
    filters: HomeDashboardSnapshotFilters = EMPTY_SNAPSHOT_FILTERS,
  ): Promise<HomeDashboardSnapshot> {
    const { data, error } = await this.supabase.rpc(
      'get_home_dashboard_snapshot',
      this.buildSnapshotRpcParams(filters),
    );

    if (error) {
      throw error;
    }

    return this.mapSnapshot((data ?? null) as HomeDashboardSnapshotRow | null);
  }

  public async getFilterOptions(): Promise<HomeDashboardFilterOptions> {
    const [zonesResult, occurrencesResult] = await Promise.all([
      this.supabase.from('zones').select('id,name,polygon').order('name'),
      this.supabase.from('occurrence_types').select('id,name').order('name'),
    ]);

    const zones: HomeDashboardZone[] = (zonesResult.data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      polygon: (row.polygon as GeoJSON.Geometry) ?? null,
    }));

    const occurrences: HomeDashboardOccurrence[] = (occurrencesResult.data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
    }));

    return { zones, occurrences };
  }

  public async getOpenOccurrences(): Promise<Array<{ plant_id: string; occurrence_type_id: string }>> {
    const { data, error } = await this.supabase.rpc('get_open_occurrences');

    if (error) {
      throw error;
    }

    return (data ?? []) as Array<{ plant_id: string; occurrence_type_id: string }>;
  }

  private mapSnapshot(snapshot: HomeDashboardSnapshotRow | null): HomeDashboardSnapshot {
    const summary = snapshot?.summary;
    const varieties = this.mapVarieties(summary?.varieties ?? []);
    const plants = this.mapPlants(snapshot?.plants ?? []);

    return {
      summary: {
        totalPlants: Number(summary?.totalPlants ?? 0),
        totalZones: Number(summary?.totalZones ?? 0),
        totalOccurrenceTypes: Number(summary?.totalOccurrenceTypes ?? 0),
        totalVarieties: Number(summary?.totalVarieties ?? varieties.length),
        varieties,
      },
      plants,
    };
  }

  private mapVarieties(rows: VarietyRow[] | null | undefined): HomeDashboardVariety[] {
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((variety) => ({
      id: variety.id,
      name: variety.name,
    }));
  }

  private mapPlants(rows: PlantMapRow[] | null | undefined): HomeDashboardPlant[] {
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows
      .filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude))
      .map((row) => ({
        id: row.id,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        varietyId: row.varietyId,
        varietyName: row.varietyName,
      }));
  }

  private buildSnapshotRpcParams(
    filters: HomeDashboardSnapshotFilters,
  ): HomeDashboardSnapshotRpcParams {
    return {
      p_period_start_date: null,
      p_period_end_date: null,
      p_planting_start_date: filters.plantingStartDate,
      p_planting_end_date: filters.plantingEndDate,
      p_operation_code: null,
    };
  }
}

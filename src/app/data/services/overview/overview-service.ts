import { inject, Injectable } from '@angular/core';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type {
  OverviewBoundaryPoint,
  OverviewFilterOptions,
  OverviewOccurrence,
  OverviewPlant,
  OverviewSnapshot,
  OverviewSnapshotFilters,
  OverviewVariety,
  OverviewZone,
} from '../../../domain/models/overview.model';
import { normalizeOrderedBoundaryPoints } from '../../../shared/utils/ordered-map-boundary';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

type VarietyRow = {
  id: number;
  name: string;
};

type ZoneOptionRow = {
  id: string;
  name: string;
  polygon: GeoJSON.Geometry | null;
};

type OccurrenceOptionRow = {
  id: string;
  name: string;
};

type PlantMapRow = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  varietyId: number | null;
  varietyName: string | null;
  isDead?: boolean | null;
  is_dead?: boolean | null;
  nonExistent?: boolean | null;
  non_existent?: boolean | null;
};

type BoundaryPointRow = {
  id?: string | null;
  latitude: number | null;
  longitude: number | null;
  order: number | null;
};

type SnapshotSummaryRow = {
  totalPlants?: number | null;
  totalZones?: number | null;
  totalOccurrenceTypes?: number | null;
  totalVarieties?: number | null;
  varieties?: VarietyRow[] | null;
};

type OverviewSnapshotRow = {
  summary?: SnapshotSummaryRow | null;
  plants?: PlantMapRow[] | null;
  farmBoundary?: BoundaryPointRow[] | null;
};

type OverviewSnapshotRpcParams = {
  p_period_start_date: string | null;
  p_period_end_date: string | null;
  p_planting_start_date: string | null;
  p_planting_end_date: string | null;
  p_operation_code: string | null;
};

const EMPTY_SNAPSHOT_FILTERS: OverviewSnapshotFilters = {
  plantingStartDate: null,
  plantingEndDate: null,
};

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async getOverviewData(
    filters: OverviewSnapshotFilters = EMPTY_SNAPSHOT_FILTERS,
    onCacheMiss?: () => void,
  ): Promise<OverviewSnapshot> {
    return this.requestCache.read(
      {
        namespace: [
          SUPABASE_CACHE_NAMESPACES.overview,
          SUPABASE_CACHE_NAMESPACES.plants,
        ],
        operation: 'overview.getOverviewData',
        params: filters,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        onCacheMiss,
      },
      async () => {
        const { data, error } = await this.supabase.rpc(
          'get_home_dashboard_snapshot',
          this.buildSnapshotRpcParams(filters),
        );

        if (error) {
          throw error;
        }

        return this.mapSnapshot(
          (data ?? null) as OverviewSnapshotRow | null,
        );
      },
    );
  }

  public async getFilterOptions(): Promise<OverviewFilterOptions> {
    const [zonesResult, occurrencesResult] = await Promise.all([
      this.requestCache.read<PostgrestResponse<ZoneOptionRow>>(
        {
          namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
          operation: 'overview.zoneOptions',
          policy: { mode: 'until-invalidated' },
          cacheWhen: (response) => !response.error,
        },
        () =>
          this.supabase.from('zones').select('id,name,polygon').order('name'),
      ),
      this.requestCache.read<PostgrestResponse<OccurrenceOptionRow>>(
        {
          namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
          operation: 'overview.occurrenceOptions',
          policy: { mode: 'until-invalidated' },
          cacheWhen: (response) => !response.error,
        },
        () =>
          this.supabase
            .from('occurrence_types')
            .select('id,name')
            .order('name'),
      ),
    ]);

    const zones: OverviewZone[] = (zonesResult.data ?? []).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      polygon: (row.polygon as GeoJSON.Geometry) ?? null,
    }));

    const occurrences: OverviewOccurrence[] = (
      occurrencesResult.data ?? []
    ).map((row) => ({
      id: row.id as string,
      name: row.name as string,
    }));

    return { zones, occurrences };
  }

  public async getOpenOccurrences(): Promise<
    Array<{ plant_id: string; occurrence_type_id: string }>
  > {
    return this.requestCache.read(
      {
        namespace: [
          SUPABASE_CACHE_NAMESPACES.occurrences,
          SUPABASE_CACHE_NAMESPACES.overview,
        ],
        operation: 'overview.getOpenOccurrences',
        policy: { mode: 'ttl', ttlMs: 15_000 },
      },
      async () => {
        const { data, error } = await this.supabase.rpc('get_open_occurrences');

        if (error) {
          throw error;
        }

        return (data ?? []) as Array<{
          plant_id: string;
          occurrence_type_id: string;
        }>;
      },
    );
  }

  private mapSnapshot(
    snapshot: OverviewSnapshotRow | null,
  ): OverviewSnapshot {
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
      farmBoundary: this.mapBoundaryPoints(snapshot?.farmBoundary ?? []),
    };
  }

  private mapVarieties(
    rows: VarietyRow[] | null | undefined,
  ): OverviewVariety[] {
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map((variety) => ({
      id: variety.id,
      name: variety.name,
    }));
  }

  private mapPlants(
    rows: PlantMapRow[] | null | undefined,
  ): OverviewPlant[] {
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows
      .filter(
        (row) =>
          Number.isFinite(row.latitude) && Number.isFinite(row.longitude),
      )
      .map((row) => ({
        id: row.id,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        varietyId: row.varietyId,
        varietyName: row.varietyName,
        isDead: Boolean(
          row.isDead ?? row.is_dead ?? row.nonExistent ?? row.non_existent,
        ),
        nonExistent: Boolean(row.nonExistent ?? row.non_existent),
      }));
  }

  private mapBoundaryPoints(
    rows: BoundaryPointRow[] | null | undefined,
  ): OverviewBoundaryPoint[] {
    return normalizeOrderedBoundaryPoints(rows).map((point) => ({
      id: point.id,
      latitude: point.latitude,
      longitude: point.longitude,
      order: point.order,
    }));
  }

  private buildSnapshotRpcParams(
    filters: OverviewSnapshotFilters,
  ): OverviewSnapshotRpcParams {
    return {
      p_period_start_date: null,
      p_period_end_date: null,
      p_planting_start_date: filters.plantingStartDate,
      p_planting_end_date: filters.plantingEndDate,
      p_operation_code: null,
    };
  }
}

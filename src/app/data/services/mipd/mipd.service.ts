import { inject, Injectable } from '@angular/core';
import type { PostgrestError, PostgrestResponse } from '@supabase/supabase-js';
import type {
  MipdMarkingInput,
  MipdOperationItem,
  MipdSyncPayload,
  MipdSyncResponse,
} from '../../../domain/models/mipd-operation.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export interface MipdQueryFilters {
  startDate?: string | null;
  endDate?: string | null;
  occurrenceTypeIds?: string[] | null;
  occurrenceTypeId?: string | null;
  zoneId?: string | null;
}

export interface MipdPlantSummary {
  id: string;
  latitude: number;
  longitude: number;
  zone_id: string | null;
  zone_name?: string | null;
  variety_name?: string | null;
}

@Injectable({ providedIn: 'root' })
export class MipdService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public readonly bucketName = 'mipd-plant-photos';

  public async getMipdOperations(
    filters: MipdQueryFilters = {},
  ): Promise<PostgrestResponse<MipdOperationItem>> {
    const args: Record<string, unknown> = {};
    if (filters.startDate) args['p_start_date'] = filters.startDate;
    if (filters.endDate) args['p_end_date'] = filters.endDate;
    if (filters.zoneId) args['p_zone_id'] = filters.zoneId;

    if (filters.occurrenceTypeIds && filters.occurrenceTypeIds.length > 0) {
      args['p_occurrence_type_ids'] = filters.occurrenceTypeIds;
    } else if (filters.occurrenceTypeId) {
      args['p_occurrence_type_id'] = filters.occurrenceTypeId;
    }

    return this.requestCache.read(
      {
        namespace: [
          SUPABASE_CACHE_NAMESPACES.operations,
          SUPABASE_CACHE_NAMESPACES.overview,
        ],
        operation: 'mipd.getMipdOperations',
        params: args,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      async () =>
        (await this.supabase.rpc(
          'get_mipd_operations',
          args,
        )) as unknown as PostgrestResponse<MipdOperationItem>,
    );
  }

  public async syncMipdMarkings(
    payload: MipdSyncPayload,
  ): Promise<{ data: MipdSyncResponse | null; error: PostgrestError | null }> {
    const response = await this.supabase.rpc('sync_mipd_markings', {
      p_payload: payload,
    });

    if (!response.error) {
      this.requestCache.invalidate(SUPABASE_CACHE_NAMESPACES.operations);
      this.requestCache.invalidate(SUPABASE_CACHE_NAMESPACES.overview);
    }

    return {
      data: response.data ? ({ markings: response.data } as MipdSyncResponse) : null,
      error: response.error,
    };
  }

  public async uploadPhoto(
    file: File,
    localMarkingId: string,
    deviceId: string,
  ): Promise<{ path: string | null; error: Error | null }> {
    try {
      const userRes = await this.supabase.auth.getUser();
      const userId = userRes.data.user?.id ?? 'anonymous';
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const objectPath = `${userId}/${deviceId}/${localMarkingId}.${fileExt}`;

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(objectPath, file, {
          upsert: true,
          contentType: file.type || 'image/jpeg',
        });

      if (error) {
        return { path: null, error };
      }

      return { path: objectPath, error: null };
    } catch (err) {
      return { path: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  public async createSignedPhotoUrl(
    photoObjectPath: string,
    expiresInSeconds = 300,
  ): Promise<{ signedUrl: string | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .createSignedUrl(photoObjectPath, expiresInSeconds);

      if (error) {
        return { signedUrl: null, error };
      }

      return { signedUrl: data?.signedUrl ?? null, error: null };
    } catch (err) {
      return { signedUrl: null, error: err instanceof Error ? err : new Error(String(err)) };
    }
  }

  public async getPestAndDiseaseOccurrenceTypes(): Promise<{
    data: Array<{ id: string; name: string }> | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabase
      .from('occurrence_types')
      .select('id, name')
      .eq('category', 'PEST_DISEASE')
      .order('name');

    return { data, error };
  }

  public async getZones(): Promise<{
    data: Array<{ id: string; name: string }> | null;
    error: PostgrestError | null;
  }> {
    const { data, error } = await this.supabase
      .from('zones')
      .select('id, name')
      .order('name');

    return { data, error };
  }

  public async getPlants(zoneId?: string | null): Promise<{
    data: MipdPlantSummary[] | null;
    error: PostgrestError | null;
  }> {
    let query = this.supabase
      .from('plants')
      .select('id, latitude, longitude, zone_id, zones(name), varieties(name)')
      .eq('is_dead', false)
      .eq('non_existent', false)
      .limit(500);

    if (zoneId) {
      query = query.eq('zone_id', zoneId);
    }

    const { data, error } = await query;
    if (error || !data) {
      return { data: null, error };
    }

    const mapped: MipdPlantSummary[] = (data as unknown as Array<{
      id: string;
      latitude: number;
      longitude: number;
      zone_id: string | null;
      zones?: { name: string } | null;
      varieties?: { name: string } | null;
    }>).map((p) => ({
      id: p.id,
      latitude: p.latitude,
      longitude: p.longitude,
      zone_id: p.zone_id,
      zone_name: p.zones?.name ?? null,
      variety_name: p.varieties?.name ?? null,
    }));

    return { data: mapped, error: null };
  }
}

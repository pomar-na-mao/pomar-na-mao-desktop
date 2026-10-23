import { inject, Injectable } from '@angular/core';
import type { PostgrestResponse } from '@supabase/supabase-js';
import type { MipdMarking } from '../../../domain/models/mipd.model';
import { SupabaseService } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

const MIPD_PHOTOS_BUCKET = 'mipd-plant-photos';
export const MIPD_SIGNED_URL_TTL_SECONDS = 300;

export interface MipdSignedPhotoResult {
  signedUrl: string | null;
  error: unknown | null;
}

@Injectable({ providedIn: 'root' })
export class MipdService {
  private supabaseService = inject(SupabaseService);
  private requestCache = inject(SupabaseRequestCacheService);

  public getMarkings(
    startDate?: string | null,
    endDate?: string | null,
    occurrenceTypeId?: string | null,
    zoneId?: string | null,
  ): Promise<PostgrestResponse<MipdMarking>> {
    const args: {
      p_start_date?: string;
      p_end_date?: string;
      p_occurrence_type_id?: string;
      p_zone_id?: string;
    } = {};
    if (startDate) args.p_start_date = startDate;
    if (endDate) args.p_end_date = endDate;
    if (occurrenceTypeId) {
      args.p_occurrence_type_id = occurrenceTypeId;
    }
    if (zoneId) {
      args.p_zone_id = zoneId;
    }

    return this.requestCache.read<PostgrestResponse<MipdMarking>>(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.operations,
        operation: 'operations.getMipd',
        params: args,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      async () =>
        (await this.supabaseService.supabase.rpc(
          'get_mipd_operations',
          args,
        )) as unknown as PostgrestResponse<MipdMarking>,
    );
  }

  public async createSignedPhotoUrl(
    objectPath: string | null,
  ): Promise<MipdSignedPhotoResult> {
    if (!objectPath) {
      return { signedUrl: null, error: null };
    }

    const { data, error } = await this.supabaseService.supabase.storage
      .from(MIPD_PHOTOS_BUCKET)
      .createSignedUrl(objectPath, MIPD_SIGNED_URL_TTL_SECONDS);

    return {
      signedUrl: data?.signedUrl ?? null,
      error,
    };
  }
}

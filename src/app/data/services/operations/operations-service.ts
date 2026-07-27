import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { PostgrestResponse } from '@supabase/supabase-js';
import { SprayingOperationResponse, InspectionOperationResponse } from '../../../domain/models/operations.model';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private supabaseService = inject(SupabaseService);
  private requestCache = inject(SupabaseRequestCacheService);

  public async getSprayingOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null
  ): Promise<PostgrestResponse<SprayingOperationResponse>> {
    const args: { p_start_date?: string; p_end_date?: string; p_zone_id?: string } = {};
    if (startDate) args.p_start_date = startDate;
    if (endDate) args.p_end_date = endDate;
    if (zoneId) args.p_zone_id = zoneId;

    return this.readOperations(
      'operations.getSpraying',
      'get_spraying_operations',
      args,
    );
  }

  public async getInspectionOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null
  ): Promise<PostgrestResponse<InspectionOperationResponse>> {
    const args: { p_start_date?: string; p_end_date?: string; p_zone_id?: string } = {};
    if (startDate) args.p_start_date = startDate;
    if (endDate) args.p_end_date = endDate;
    if (zoneId) args.p_zone_id = zoneId;

    return this.readOperations(
      'operations.getInspection',
      'get_inspection_operations',
      args,
    );
  }

  public async getAnnotationOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null
  ): Promise<PostgrestResponse<InspectionOperationResponse>> {
    const args: { p_start_date?: string; p_end_date?: string; p_zone_id?: string } = {};
    if (startDate) args.p_start_date = startDate;
    if (endDate) args.p_end_date = endDate;
    if (zoneId) args.p_zone_id = zoneId;

    return this.readOperations(
      'operations.getAnnotation',
      'get_annotation_operations',
      args,
    );
  }

  private readOperations<T>(
    operation: string,
    rpcName: string,
    args: { p_start_date?: string; p_end_date?: string; p_zone_id?: string },
  ): Promise<PostgrestResponse<T>> {
    return this.requestCache.read<PostgrestResponse<T>>(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.operations,
        operation,
        params: args,
        policy: { mode: 'ttl', ttlMs: 15_000 },
        cacheWhen: (response) => !response.error,
      },
      async () =>
        await this.supabaseService.supabase.rpc(rpcName, args) as unknown as PostgrestResponse<T>,
    );
  }
}

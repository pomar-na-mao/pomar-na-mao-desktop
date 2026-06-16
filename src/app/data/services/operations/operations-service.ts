import { inject, Injectable } from '@angular/core';
import { SupabaseService } from '../supabase';
import { PostgrestResponse } from '@supabase/supabase-js';
import { SprayingOperationResponse, InspectionOperationResponse } from '../../../domain/models/operations.model';

@Injectable({
  providedIn: 'root'
})
export class OperationsService {
  private supabaseService = inject(SupabaseService);

  public async getSprayingOperations(
    startDate?: string | null,
    endDate?: string | null,
    zoneId?: string | null
  ): Promise<PostgrestResponse<SprayingOperationResponse>> {
    const args: { p_start_date?: string; p_end_date?: string; p_zone_id?: string } = {};
    if (startDate) args.p_start_date = startDate;
    if (endDate) args.p_end_date = endDate;
    if (zoneId) args.p_zone_id = zoneId;

    return this.supabaseService.supabase.rpc('get_spraying_operations', args);
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

    return this.supabaseService.supabase.rpc('get_inspection_operations', args);
  }
}

import { Injectable } from "@angular/core";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Alerts } from "../../../domain/models/alerts.model";
import { injectSupabase } from "../supabase";

export interface IAlertsService {
  findAll(): Promise<PostgrestSingleResponse<Alerts[]>>;
  findById(id: string): Promise<PostgrestSingleResponse<Alerts>>;
}

@Injectable({
  providedIn: 'root',
})
export class AlertsService implements IAlertsService {
  public supabase = injectSupabase();

  public async findAll(): Promise<PostgrestSingleResponse<Alerts[]>> {
    return await this.supabase
      .from('alerts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Alerts>> {
    return await this.supabase.from('alerts').select('*').eq('id', id).single();
  }
}

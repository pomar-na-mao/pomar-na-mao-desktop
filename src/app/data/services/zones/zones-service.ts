import { Injectable } from "@angular/core";
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type { Zone } from "../../../domain/models/zone.model";
import { injectSupabase } from "../supabase";

export interface IZonesService {
  findAll(): Promise<PostgrestResponse<Zone>>;
  findById(id: string): Promise<PostgrestSingleResponse<Zone>>;
}

@Injectable({
  providedIn: 'root',
})
export class ZonesService implements IZonesService {
  public supabase = injectSupabase();

  public async findAll(): Promise<PostgrestResponse<Zone>> {
    return await this.supabase
      .from('zones')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Zone>> {
    return await this.supabase.from('zones').select('*').eq('id', id).single();
  }
}

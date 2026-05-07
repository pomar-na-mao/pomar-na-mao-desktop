import { Injectable } from "@angular/core";
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type { Region } from "../../../domain/models/regions.model";
import { injectSupabase } from "../supabase";

export interface IRegionsService {
  findAll(): Promise<PostgrestResponse<Region>>;
  findById(id: string): Promise<PostgrestSingleResponse<Region>>;
}

@Injectable({
  providedIn: 'root',
})
export class RegionsService implements IRegionsService {
  public supabase = injectSupabase();

  public async findAll(): Promise<PostgrestResponse<Region>> {
    return await this.supabase
      .from('regions')
      .select('*', { count: 'exact' })
      .order('region', { ascending: true });
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Region>> {
    return await this.supabase.from('regions').select('*').eq('id', id).single();
  }
}

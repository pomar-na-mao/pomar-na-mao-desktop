import { Injectable } from "@angular/core";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { Region } from "../../../domain/models/regions.model";
import { injectSupabase } from "../supabase";

export interface IRegionsService {
  findAll(): Promise<PostgrestSingleResponse<Region[]>>;
  findById(id: string): Promise<PostgrestSingleResponse<Region>>;
}

@Injectable({
  providedIn: 'root',
})
export class RegionsService implements IRegionsService {
  public supabase = injectSupabase();

  public async findAll(): Promise<PostgrestSingleResponse<Region[]>> {
    return await this.supabase.from('regions').select('*').order('region');
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Region>> {
    return await this.supabase.from('regions').select('*').eq('id', id).single();
  }
}

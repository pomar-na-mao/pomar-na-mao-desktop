
import { Injectable } from "@angular/core";
import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import type { Plant, PlantInsert } from "../../../domain/models/plant-data.model";
import { injectSupabase } from "../supabase";

export type InspectRoutineFilter = {
  region: string;
  occurrence: string;
  variety?: string;
}

export interface IPlantsService {
  findAll(filters: InspectRoutineFilter | null): Promise<PostgrestSingleResponse<Plant[]>>;
  findById(id: string): Promise<PostgrestSingleResponse<Plant>>;
  delete(id: string): Promise<PostgrestSingleResponse<null>>;
  insert(plant: PlantInsert): Promise<PostgrestSingleResponse<Plant>>;
  getTotalCount(): Promise<number>;
  getAliveCount(): Promise<number>;
  getUpdatedCount(): Promise<number>;
  getLatestUpdatedAt(): Promise<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class PlantsService implements IPlantsService {

  public supabase = injectSupabase();

  public async findAll(filters: InspectRoutineFilter | null): Promise<PostgrestSingleResponse<Plant[]>> {
    let query = this.supabase.from('plants').select('*').order('created_at', { ascending: false });

    if (filters) {
      const { region, occurrence, variety } = filters;

      if (region) {
        query = query.eq('region', region);
      }

      if (occurrence) {
        query = query.eq(occurrence, true);
      }

      if (variety) {
        query = query.eq('variety', variety);
      }
    }
    return await query;
  }

  public async findById(id: string): Promise<PostgrestSingleResponse<Plant>> {
    return await this.supabase.from('plants').select('*').eq('id', id).single();
  }

  public async delete(id: string): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.from('plants').delete().eq('id', id);
  }

  public async insert(plant: PlantInsert): Promise<PostgrestSingleResponse<Plant>> {
    return await this.supabase.from('plants').insert([plant]).select().single();
  }

  public async getTotalCount(): Promise<number> {
    const { count, error } = await this.supabase.from('plants').select('*', { count: 'exact', head: true });
    return error ? 0 : (count || 0);
  }

  public async getAliveCount(): Promise<number> {
    const { count, error } = await this.supabase.from('plants').select('*', { count: 'exact', head: true }).eq('is_dead', false);
    return error ? 0 : (count || 0);
  }

  public async getUpdatedCount(): Promise<number> {
    const { count, error } = await this.supabase.from('plants').select('*', { count: 'exact', head: true }).not('updated_at', 'is', null);
    return error ? 0 : (count || 0);
  }

  public async getLatestUpdatedAt(): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('plants')
      .select('updated_at')
      .not('updated_at', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return error ? null : data?.updated_at;
  }
}

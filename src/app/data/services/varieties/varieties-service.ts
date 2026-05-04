import { Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import type {
  Variety,
  VarietyInsert,
  VarietyUpdate,
} from '../../../domain/models/variety.model';
import { injectSupabase } from '../supabase';

export interface IVarietiesService {
  findAll(): Promise<PostgrestResponse<Variety>>;
  insert(variety: VarietyInsert): Promise<PostgrestSingleResponse<Variety>>;
  update(
    id: number,
    variety: VarietyUpdate,
  ): Promise<PostgrestSingleResponse<Variety>>;
  delete(id: number): Promise<PostgrestSingleResponse<null>>;
}

@Injectable({
  providedIn: 'root',
})
export class VarietiesService implements IVarietiesService {
  public supabase = injectSupabase();

  public async findAll(): Promise<PostgrestResponse<Variety>> {
    return await this.supabase
      .from('varieties')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });
  }

  public async insert(
    variety: VarietyInsert,
  ): Promise<PostgrestSingleResponse<Variety>> {
    return await this.supabase
      .from('varieties')
      .insert([variety])
      .select()
      .single();
  }

  public async update(
    id: number,
    variety: VarietyUpdate,
  ): Promise<PostgrestSingleResponse<Variety>> {
    return await this.supabase
      .from('varieties')
      .update(variety)
      .eq('id', id)
      .select()
      .single();
  }

  public async delete(id: number): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.from('varieties').delete().eq('id', id);
  }
}

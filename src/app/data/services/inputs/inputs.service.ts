import { inject, Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import {
  DEFAULT_INPUT_TYPES,
  type InputCreate,
  type InputDraft,
  type InputItem,
  type InputUpdate,
} from '../../../domain/models/input.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export interface IInputsService {
  findAll(): Promise<PostgrestResponse<InputItem>>;
  create(payload: InputDraft): Promise<PostgrestSingleResponse<InputItem>>;
  update(
    id: string,
    payload: InputDraft,
  ): Promise<PostgrestSingleResponse<InputItem>>;
  deleteMany(ids: string[]): Promise<PostgrestSingleResponse<null>>;
  fetchEnumValues(): Promise<string[]>;
  addEnumValue(value: string): Promise<{ error: Error | null }>;
}

@Injectable({ providedIn: 'root' })
export class InputsService implements IInputsService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<InputItem>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'inputs.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('inputs')
          .select('*', { count: 'exact' })
          .order('updated_at', { ascending: false }),
    ) as Promise<PostgrestResponse<InputItem>>;
  }

  public async create(
    payload: InputDraft,
  ): Promise<PostgrestSingleResponse<InputItem>> {
    const timestamp = new Date().toISOString();
    const persistedPayload: InputCreate = {
      ...payload,
      created_at: timestamp,
      updated_at: timestamp,
    };
    const response = (await this.supabase
      .from('inputs')
      .insert([persistedPayload])
      .select('*')
      .single()) as PostgrestSingleResponse<InputItem>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async update(
    id: string,
    payload: InputDraft,
  ): Promise<PostgrestSingleResponse<InputItem>> {
    const persistedPayload: InputUpdate = {
      ...payload,
      updated_at: new Date().toISOString(),
    };
    const response = (await this.supabase
      .from('inputs')
      .update(persistedPayload)
      .eq('id', id)
      .select('*')
      .single()) as PostgrestSingleResponse<InputItem>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async deleteMany(
    ids: string[],
  ): Promise<PostgrestSingleResponse<null>> {
    const response = (await this.supabase
      .from('inputs')
      .delete()
      .in('id', ids)) as PostgrestSingleResponse<null>;

    this.invalidateReadsWhenSuccessful(response.error);
    return response;
  }

  public async fetchEnumValues(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase.rpc(
        'get_input_type_enum_values',
      );
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((item: { value: string } | string) =>
          typeof item === 'string' ? item : item.value,
        );
      }
    } catch {
      // Fallback para os tipos pré-configurados
    }
    return [...DEFAULT_INPUT_TYPES];
  }

  public async addEnumValue(value: string): Promise<{ error: Error | null }> {
    const upperValue = value.trim().toUpperCase();
    try {
      const { error } = await this.supabase.rpc('add_input_type_enum_value', {
        new_value: upperValue,
      });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }

  private invalidateReadsWhenSuccessful(error: unknown): void {
    if (error) return;
    this.requestCache.invalidate([
      SUPABASE_CACHE_NAMESPACES.referenceData,
    ]);
  }
}

import { inject, Injectable } from '@angular/core';
import type {
  PostgrestError,
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import type {
  MixtureDraft,
  MixtureItem,
} from '../../../domain/models/mixture.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export interface IMixturesService {
  findAll(): Promise<PostgrestResponse<MixtureItem>>;
  create(payload: MixtureDraft): Promise<{ data: MixtureItem | null; error: PostgrestError | null }>;
  update(id: string, payload: MixtureDraft): Promise<{ data: MixtureItem | null; error: PostgrestError | null }>;
  deleteMany(ids: string[]): Promise<PostgrestSingleResponse<null>>;
}

@Injectable({ providedIn: 'root' })
export class MixturesService implements IMixturesService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<MixtureItem>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'mixtures.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('mixtures')
          .select('*, inputs:mixture_inputs(*, input:inputs(*))', { count: 'exact' })
          .order('updated_at', { ascending: false }),
    ) as Promise<PostgrestResponse<MixtureItem>>;
  }

  public async create(
    payload: MixtureDraft,
  ): Promise<{ data: MixtureItem | null; error: PostgrestError | null }> {
    const timestamp = new Date().toISOString();
    const mixtureRow = {
      name: payload.name.trim(),
      registered_by_name: payload.registered_by_name.trim(),
      registered_by_email: payload.registered_by_email.trim(),
      is_active: payload.is_active,
      observations: payload.observations?.trim() || null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const { data: createdMixture, error: mixtureError } = await this.supabase
      .from('mixtures')
      .insert([mixtureRow])
      .select('*')
      .single();

    if (mixtureError || !createdMixture) {
      return { data: null, error: mixtureError };
    }

    if (payload.inputs && payload.inputs.length > 0) {
      const itemsToInsert = payload.inputs.map((item) => ({
        mixture_id: createdMixture.id,
        input_id: item.input_id,
        dose: item.dose.trim(),
        dose_unit: item.dose_unit?.trim() || null,
      }));

      const { error: itemsError } = await this.supabase
        .from('mixture_inputs')
        .insert(itemsToInsert);

      if (itemsError) {
        // Rollback criação do mestre
        await this.supabase.from('mixtures').delete().eq('id', createdMixture.id);
        return { data: null, error: itemsError };
      }
    }

    this.invalidateReads();

    // Busca o registro completo com os relacionamentos
    const { data: fullMixture, error: fetchError } = await this.supabase
      .from('mixtures')
      .select('*, inputs:mixture_inputs(*, input:inputs(*))')
      .eq('id', createdMixture.id)
      .single();

    return { data: fullMixture ?? createdMixture, error: fetchError };
  }

  public async update(
    id: string,
    payload: MixtureDraft,
  ): Promise<{ data: MixtureItem | null; error: PostgrestError | null }> {
    const timestamp = new Date().toISOString();
    const updateRow = {
      name: payload.name.trim(),
      is_active: payload.is_active,
      observations: payload.observations?.trim() || null,
      updated_at: timestamp,
    };

    const { data: updatedMixture, error: updateError } = await this.supabase
      .from('mixtures')
      .update(updateRow)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError || !updatedMixture) {
      return { data: null, error: updateError };
    }

    // Remove itens anteriores e insere os novos
    const { error: deleteError } = await this.supabase
      .from('mixture_inputs')
      .delete()
      .eq('mixture_id', id);

    if (deleteError) {
      return { data: null, error: deleteError };
    }

    if (payload.inputs && payload.inputs.length > 0) {
      const itemsToInsert = payload.inputs.map((item) => ({
        mixture_id: id,
        input_id: item.input_id,
        dose: item.dose.trim(),
        dose_unit: item.dose_unit?.trim() || null,
      }));

      const { error: insertItemsError } = await this.supabase
        .from('mixture_inputs')
        .insert(itemsToInsert);

      if (insertItemsError) {
        return { data: null, error: insertItemsError };
      }
    }

    this.invalidateReads();

    const { data: fullMixture, error: fetchError } = await this.supabase
      .from('mixtures')
      .select('*, inputs:mixture_inputs(*, input:inputs(*))')
      .eq('id', id)
      .single();

    return { data: fullMixture ?? updatedMixture, error: fetchError };
  }

  public async deleteMany(
    ids: string[],
  ): Promise<PostgrestSingleResponse<null>> {
    const response = (await this.supabase
      .from('mixtures')
      .delete()
      .in('id', ids)) as PostgrestSingleResponse<null>;

    this.invalidateReads();
    return response;
  }

  private invalidateReads(): void {
    this.requestCache.invalidate([SUPABASE_CACHE_NAMESPACES.referenceData]);
  }
}

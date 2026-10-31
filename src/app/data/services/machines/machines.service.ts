import { inject, Injectable } from '@angular/core';
import type {
  PostgrestResponse,
  PostgrestSingleResponse,
} from '@supabase/supabase-js';
import type {
  MachineCreate,
  MachineDraft,
  MachineItem,
  MachineUpdate,
} from '../../../domain/models/machine.model';
import { injectSupabase } from '../supabase';
import {
  SUPABASE_CACHE_NAMESPACES,
  SupabaseRequestCacheService,
} from '../supabase-request-cache/supabase-request-cache.service';

export interface IMachinesService {
  findAll(): Promise<PostgrestResponse<MachineItem>>;
  create(payload: MachineDraft): Promise<PostgrestSingleResponse<MachineItem>>;
  update(
    id: string,
    payload: MachineDraft,
  ): Promise<PostgrestSingleResponse<MachineItem>>;
  deleteMany(ids: string[]): Promise<PostgrestSingleResponse<null>>;
}

@Injectable({ providedIn: 'root' })
export class MachinesService implements IMachinesService {
  public supabase = injectSupabase();
  private requestCache = inject(SupabaseRequestCacheService);

  public async findAll(): Promise<PostgrestResponse<MachineItem>> {
    return this.requestCache.read(
      {
        namespace: SUPABASE_CACHE_NAMESPACES.referenceData,
        operation: 'machines.findAll',
        policy: { mode: 'until-invalidated' },
        cacheWhen: (response) => !response.error,
      },
      () =>
        this.supabase
          .from('machines')
          .select(
            'id, name, brand, acquisition_date, manufacturing_year, quantity, observations, created_at, updated_at',
            { count: 'exact' },
          )
          .order('name', { ascending: true }),
    ) as Promise<PostgrestResponse<MachineItem>>;
  }

  public async create(
    payload: MachineDraft,
  ): Promise<PostgrestSingleResponse<MachineItem>> {
    const timestamp = new Date().toISOString();
    const persistedPayload: MachineCreate = {
      ...payload,
      quantity: payload.quantity && payload.quantity >= 1 ? payload.quantity : 1,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const response = (await this.supabase
      .from('machines')
      .insert(persistedPayload)
      .select(
        'id, name, brand, acquisition_date, manufacturing_year, quantity, observations, created_at, updated_at',
      )
      .single()) as PostgrestSingleResponse<MachineItem>;

    if (!response.error) {
      this.requestCache.invalidate(SUPABASE_CACHE_NAMESPACES.referenceData);
    }

    return response;
  }

  public async update(
    id: string,
    payload: MachineDraft,
  ): Promise<PostgrestSingleResponse<MachineItem>> {
    const timestamp = new Date().toISOString();
    const persistedPayload: MachineUpdate = {
      ...payload,
      quantity: payload.quantity && payload.quantity >= 1 ? payload.quantity : 1,
      updated_at: timestamp,
    };

    const response = (await this.supabase
      .from('machines')
      .update(persistedPayload)
      .eq('id', id)
      .select(
        'id, name, brand, acquisition_date, manufacturing_year, quantity, observations, created_at, updated_at',
      )
      .single()) as PostgrestSingleResponse<MachineItem>;

    if (!response.error) {
      this.requestCache.invalidate(SUPABASE_CACHE_NAMESPACES.referenceData);
    }

    return response;
  }

  public async deleteMany(
    ids: string[],
  ): Promise<PostgrestSingleResponse<null>> {
    const response = (await this.supabase
      .from('machines')
      .delete()
      .in('id', ids)) as PostgrestSingleResponse<null>;

    if (!response.error) {
      this.requestCache.invalidate(SUPABASE_CACHE_NAMESPACES.referenceData);
    }

    return response;
  }
}

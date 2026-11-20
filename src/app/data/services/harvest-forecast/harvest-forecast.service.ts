import { Injectable } from '@angular/core';
import type { PostgrestError } from '@supabase/supabase-js';
import type {
  HarvestForecastQuery,
  HarvestForecastSnapshot,
  HarvestForecastUpdate,
  HarvestForecastUpdateResult,
} from '../../../domain/models/harvest-forecast.model';
import { injectSupabase } from '../supabase';

export interface IHarvestForecastService {
  getSnapshot(query?: HarvestForecastQuery): Promise<HarvestForecastSnapshot>;
  updateClassification(update: HarvestForecastUpdate): Promise<HarvestForecastUpdateResult>;
}

@Injectable({ providedIn: 'root' })
export class HarvestForecastService implements IHarvestForecastService {
  private readonly supabase = injectSupabase();

  public async getSnapshot(
    query: HarvestForecastQuery = {},
  ): Promise<HarvestForecastSnapshot> {
    const { data, error } = await this.supabase.rpc('get_harvest_forecast', {
      p_year: query.year ?? null,
      p_classification:
        query.classification && query.classification !== 'TODAS'
          ? query.classification
          : null,
      p_zone_id: query.zoneId || null,
      p_scenario: query.scenario ?? 'REALISTA',
      p_weights: query.weights ?? null,
    });

    if (error) {
      throw error;
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('A previsão de safra retornou uma resposta inválida.');
    }

    return data as unknown as HarvestForecastSnapshot;
  }

  public async updateClassification(
    update: HarvestForecastUpdate,
  ): Promise<HarvestForecastUpdateResult> {
    const response = await this.supabase
      .rpc('update_harvest_forecast_classification', {
        p_id: update.id,
        p_classification: update.classification,
        p_expected_updated_at: update.expectedUpdatedAt,
      })
      .single();

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('A edição da previsão de safra não retornou dados.');
    }

    return response.data as HarvestForecastUpdateResult;
  }
}

export const isHarvestForecastConflict = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as PostgrestError).code === 'P0002';

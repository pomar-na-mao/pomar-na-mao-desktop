import { Injectable } from '@angular/core';
import { injectSupabase } from '../supabase';
import type { MassUpdatePlantsParams, MassUpdatePlantsResult } from '../../../domain/models/mass-inclusion';


@Injectable({
  providedIn: 'root',
})
export class MassInclusionService {
  private supabase = injectSupabase();

  public async massUpdatePlantsInPolygon(
    params: MassUpdatePlantsParams
  ): Promise<{ data: MassUpdatePlantsResult | null; error: unknown }> {
    const { coordinates, occurrences, variety, lifeOfTree, plantingDate, description } = params;

    const { data, error } = await this.supabase.rpc('mass_update_plants_in_polygon', {
      coordinates: coordinates as unknown as never,
      occurrences: occurrences ?? [],
      variety: variety ?? null,
      life_of_tree_param: lifeOfTree ?? null,
      planting_date_param: plantingDate ?? null,
      description_param: description ?? null,
    });

    return { data: data as MassUpdatePlantsResult | null, error };
  }
}

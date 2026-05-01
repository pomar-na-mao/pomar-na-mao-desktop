import { Injectable } from "@angular/core";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { INewPlant } from "../../../domain/models/new-plant.model";
import { injectSupabase } from "../supabase";

export interface INewPlantsService {
  getNewPlants(): Promise<PostgrestSingleResponse<INewPlant[]>>;
  approveNewPlant(newPlantId: string): Promise<PostgrestSingleResponse<null>>;
}

@Injectable({
  providedIn: 'root',
})
export class NewPlantsService implements INewPlantsService {
  private supabase = injectSupabase();

  public async getNewPlants(): Promise<PostgrestSingleResponse<INewPlant[]>> {
    return await this.supabase
      .from('new_plants')
      .select('*')
      .order('created_at', { ascending: false });
  }

  public async approveNewPlant(newPlantId: string): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.rpc('approve_new_plant', {
      p_new_plant_id: newPlantId
    });
  }
}

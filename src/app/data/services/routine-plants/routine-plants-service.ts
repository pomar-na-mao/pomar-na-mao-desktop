import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { IRoutinePlants } from "../../../domain/models/routine-plants.model";
import type { PlantData } from "../../../domain/models/plant-data.model";

export interface IRoutinePlantsService {
  findByRoutineId(routineId: number): Promise<PostgrestSingleResponse<IRoutinePlants[]>>;
}

@Injectable({
  providedIn: 'root',
})
export class RoutinePlantsService implements IRoutinePlantsService {
  private supabase = injectSupabase();

  public async findByRoutineId(routineId: number): Promise<PostgrestSingleResponse<IRoutinePlants[]>> {
    return await this.supabase
      .from('routines_plants')
      .select('*')
      .eq('routine_id', routineId)
      .order('id', { ascending: true });
  }

  public async updatePlantFromRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    routinePlantId: string,
    informations: Partial<PlantData>,
  ): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.rpc('update_plant_from_routine', {
      plant_id: plantId,
      occurrences,
      routine_plant_id: routinePlantId,
      informations,
    });
  }

  public async approveWorkAnnotation(
    annotationId: string,
  ): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.rpc('approve_work_annotation', {
      p_annotation_id: annotationId,
    });
  }
}

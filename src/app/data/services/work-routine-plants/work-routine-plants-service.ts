import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { IWorkRoutinePlants } from "../../../domain/models/work-routine-plants.model";
import type { PlantData } from "../../../domain/models/plant-data.model";

export interface IWorkRoutinePlantsService {
  findByWorkRoutineId(routineId: number): Promise<PostgrestSingleResponse<IWorkRoutinePlants[]>>;
}

@Injectable({
  providedIn: 'root',
})
export class WorkRoutinePlantsService implements IWorkRoutinePlantsService {
  private supabase = injectSupabase();

  public async findByWorkRoutineId(routineId: number): Promise<PostgrestSingleResponse<IWorkRoutinePlants[]>> {
    return await this.supabase
      .from('work_routines_plants')
      .select('*')
      .eq('routine_id', routineId)
      .order('id', { ascending: true });
  }

  public async updatePlantFromWorkRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    workRoutinePlantId: string,
    informations: Partial<PlantData>,
  ): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.rpc('update_plant_from_work_routine', {
      plant_id: plantId,
      occurrences,
      work_routine_plant_id: workRoutinePlantId,
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

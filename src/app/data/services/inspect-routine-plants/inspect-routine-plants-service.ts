import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { IInspectRoutinePlants } from "../../../domain/models/inspect-routine-plants.model";
import type { PlantData } from "../../../domain/models/plant-data.model";

export interface IInspectRoutinePlantsService {
  findByInspectRoutineId(routineId: number): Promise<PostgrestSingleResponse<IInspectRoutinePlants[]>>;
}

@Injectable({
  providedIn: 'root',
})
export class InspectRoutinePlantsService implements IInspectRoutinePlantsService {
  private supabase = injectSupabase();

  public async findByInspectRoutineId(routineId: number): Promise<PostgrestSingleResponse<IInspectRoutinePlants[]>> {
    return await this.supabase
      .from('inspect_routines_plants')
      .select('*')
      .eq('routine_id', routineId);
  }

  public async updatePlantFromInspectRoutine(
    plantId: string,
    occurrences: {
      [k: string]: boolean;
    },
    inspectRoutinePlantId: string,
    informations: Partial<PlantData>,
  ): Promise<PostgrestSingleResponse<null>> {
    return await this.supabase.rpc('update_plant_from_inspect_routine', {
      plant_id: plantId,
      occurrences,
      inspect_routine_plant_id: inspectRoutinePlantId,
      informations,
    });
  }
}

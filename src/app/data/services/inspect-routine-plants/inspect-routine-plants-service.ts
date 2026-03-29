import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";
import type { IInspectRoutinePlants } from "../../../domain/models/inspect-routine-plants.model";

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
}

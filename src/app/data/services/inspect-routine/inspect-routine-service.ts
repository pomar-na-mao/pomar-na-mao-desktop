import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { IInspectRoutine } from "../../../domain/models/inspect-routine.model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface IInspectRoutineService {
  getInspectRoutines(): Promise<PostgrestSingleResponse<IInspectRoutine[]>>;
}

@Injectable({
  providedIn: 'root',
})
export class InspectRoutineService implements IInspectRoutineService {
  private supabase = injectSupabase();

  public async getInspectRoutines(): Promise<PostgrestSingleResponse<IInspectRoutine[]>> {
    return await this.supabase
      .from('inspect_routines')
      .select('*')
      .order('date', { ascending: false });
  }

}

import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { IWorkRoutine } from "../../../domain/models/work-routine.model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface IWorkRoutineService {
  getWorkRoutines(): Promise<PostgrestSingleResponse<IWorkRoutine[]>>;
}

@Injectable({
  providedIn: 'root',
})
export class WorkRoutineService implements IWorkRoutineService {
  private supabase = injectSupabase();

  public async getWorkRoutines(): Promise<PostgrestSingleResponse<IWorkRoutine[]>> {
    return await this.supabase
      .from('work_routines')
      .select('*')
      .order('created_at', { ascending: false });
  }

}

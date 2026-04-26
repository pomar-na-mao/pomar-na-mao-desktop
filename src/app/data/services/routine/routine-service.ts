import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { IRoutine } from "../../../domain/models/routine.model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface IRoutineService {
  getRoutines(): Promise<PostgrestSingleResponse<IRoutine[]>>;
}

@Injectable({
  providedIn: 'root',
})
export class RoutineService implements IRoutineService {
  private supabase = injectSupabase();

  public async getRoutines(): Promise<PostgrestSingleResponse<IRoutine[]>> {
    return await this.supabase
      .from('routines')
      .select('*')
      .order('created_at', { ascending: false });
  }

}

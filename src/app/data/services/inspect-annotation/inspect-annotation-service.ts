import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { IInspectAnnotation } from "../../../domain/models/inspect-annotation.model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface IInspectAnnotationService {
  getInspectAnnotations(): Promise<PostgrestSingleResponse<IInspectAnnotation[]>>;
}

@Injectable({
  providedIn: 'root',
})
export class InspectAnnotationService implements IInspectAnnotationService {
  private supabase = injectSupabase();

  public async getInspectAnnotations(): Promise<PostgrestSingleResponse<IInspectAnnotation[]>> {
    return await this.supabase
      .from('inspect_annotations')
      .select('*')
      .order('created_at', { ascending: false });
  }
}

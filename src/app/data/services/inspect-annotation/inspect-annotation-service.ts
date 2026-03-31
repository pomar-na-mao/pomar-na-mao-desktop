import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { IInspectAnnotation } from "../../../domain/models/inspect-annotation.model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface IInspectAnnotationService {
  getInspectAnnotations(): Promise<PostgrestSingleResponse<IInspectAnnotation[]>>;
  approveInspectAnnotation(id: string): Promise<PostgrestSingleResponse<string>>
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

  public async approveInspectAnnotation(id: string): Promise<PostgrestSingleResponse<string>> {
    return await this.supabase.rpc('approve_inspect_annotation', {
      p_annotation_id: id,
    });
  }
}

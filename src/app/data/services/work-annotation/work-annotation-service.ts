import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { IWorkAnnotation } from "../../../domain/models/work-annotation.model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface IWorkAnnotationService {
  getWorkAnnotations(): Promise<PostgrestSingleResponse<IWorkAnnotation[]>>;
  approveWorkAnnotation(id: string): Promise<PostgrestSingleResponse<string>>
}

@Injectable({
  providedIn: 'root',
})
export class WorkAnnotationService implements IWorkAnnotationService {
  private supabase = injectSupabase();

  public async getWorkAnnotations(): Promise<PostgrestSingleResponse<IWorkAnnotation[]>> {
    return await this.supabase
      .from('work_annotations')
      .select('*')
      .order('created_at', { ascending: false });
  }

  public async approveWorkAnnotation(id: string): Promise<PostgrestSingleResponse<string>> {
    return await this.supabase.rpc('approve_work_annotation', {
      p_annotation_id: id,
    });
  }
}

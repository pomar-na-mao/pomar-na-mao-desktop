import { Injectable } from "@angular/core";
import { injectSupabase } from "../supabase";
import type { IAnnotation } from "../../../domain/models/annotation.model";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

export interface IAnnotationService {
  getAnnotations(): Promise<PostgrestSingleResponse<IAnnotation[]>>;
  approveAnnotation(id: string): Promise<PostgrestSingleResponse<string>>
}

@Injectable({
  providedIn: 'root',
})
export class AnnotationService implements IAnnotationService {
  private supabase = injectSupabase();

  public async getAnnotations(): Promise<PostgrestSingleResponse<IAnnotation[]>> {
    return await this.supabase
      .from('annotations')
      .select('*')
      .order('created_at', { ascending: false });
  }

  public async approveAnnotation(id: string): Promise<PostgrestSingleResponse<string>> {
    return await this.supabase.rpc('approve_annotation', {
      p_annotation_id: id,
    });
  }
}

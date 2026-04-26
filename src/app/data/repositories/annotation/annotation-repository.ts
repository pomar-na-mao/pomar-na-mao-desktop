import { computed, inject, Injectable, signal } from "@angular/core";
import { AnnotationService } from "../../services/annotation/annotation-service";
import type { IAnnotation } from "../../../domain/models/annotation.model";

@Injectable({
  providedIn: 'root',
})
export class AnnotationRepository {
  private annotationService = inject(AnnotationService);

  private _annotations = signal<IAnnotation[]>([]);
  public annotations = this._annotations.asReadonly();

  private _selectedAnnotationId = signal<string | null>(null);
  public selectedAnnotation = computed(() => {
    const id = this._selectedAnnotationId();
    if (!id) return null;
    return this._annotations().find(a => a.id === id) ?? null;
  });

  public setSelectedAnnotationId(id: string | null) {
    this._selectedAnnotationId.set(id);
  }

  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();

  public async fetchAnnotations(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const { data, error } = await this.annotationService.getAnnotations();
      if (error) throw error;
      this._annotations.set(data ?? []);
    } catch (error) {
      this._error.set(`Error fetching annotations\n${JSON.stringify(error)}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  public async approveAnnotation(id: string) {
    const { data, error } = await this.annotationService.approveAnnotation(id);

    return { data, error };
  }


}

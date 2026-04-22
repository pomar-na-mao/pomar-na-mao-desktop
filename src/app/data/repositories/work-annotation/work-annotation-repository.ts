import { computed, inject, Injectable, signal } from "@angular/core";
import { WorkAnnotationService } from "../../services/work-annotation/work-annotation-service";
import type { IWorkAnnotation } from "../../../domain/models/work-annotation.model";

@Injectable({
  providedIn: 'root',
})
export class WorkAnnotationRepository {
  private workAnnotationService = inject(WorkAnnotationService);

  private _workAnnotations = signal<IWorkAnnotation[]>([]);
  public workAnnotations = this._workAnnotations.asReadonly();

  private _selectedAnnotationId = signal<string | null>(null);
  public selectedAnnotation = computed(() => {
    const id = this._selectedAnnotationId();
    if (!id) return null;
    return this._workAnnotations().find(a => a.id === id) ?? null;
  });

  public setSelectedAnnotationId(id: string | null) {
      this._selectedAnnotationId.set(id);
  }

  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();

  public async fetchWorkAnnotations(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const { data, error } = await this.workAnnotationService.getWorkAnnotations();
      if (error) throw error;
      this._workAnnotations.set(data ?? []);
    } catch (error) {
      this._error.set(`Error fetching work annotations\n${JSON.stringify(error)}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  public async approveWorkAnnotation(id: string) {
    const { data, error } = await this.workAnnotationService.approveWorkAnnotation(id);

    return { data, error };
  }


}

import { inject, Injectable, signal } from "@angular/core";
import { InspectAnnotationService } from "../../services/inspect-annotation/inspect-annotation-service";
import type { IInspectAnnotation } from "../../../domain/models/inspect-annotation.model";

@Injectable({
  providedIn: 'root',
})
export class InspectAnnotationRepository {
  private inspectAnnotationService = inject(InspectAnnotationService);

  private _inspectAnnotations = signal<IInspectAnnotation[]>([]);
  public inspectAnnotations = this._inspectAnnotations.asReadonly();

  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  public error = this._error.asReadonly();

  public async fetchInspectAnnotations(): Promise<void> {
    this._isLoading.set(true);
    this._error.set(null);
    try {
      const { data, error } = await this.inspectAnnotationService.getInspectAnnotations();
      if (error) throw error;
      this._inspectAnnotations.set(data ?? []);
    } catch (error) {
      this._error.set(`Error fetching inspect annotations\n${JSON.stringify(error)}`);
    } finally {
      this._isLoading.set(false);
    }
  }

  public async approveInspectAnnotation(id: string) {
    const { data, error } = await this.inspectAnnotationService.approveInspectAnnotation(id);

    return { data, error };
  }


}

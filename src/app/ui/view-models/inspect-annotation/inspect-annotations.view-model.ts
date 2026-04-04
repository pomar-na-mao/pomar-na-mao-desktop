import { inject, Injectable } from '@angular/core';
import { InspectAnnotationRepository } from '../../../data/repositories/inspect-annotation/inspect-annotation-repository';

@Injectable({
  providedIn: 'root',
})
export class InspectAnnotationsViewModel {
  private repository = inject(InspectAnnotationRepository);

  public annotations = this.repository.inspectAnnotations;
  public isLoading = this.repository.isLoading;
  public error = this.repository.error;

  public async loadAnnotations(): Promise<void> {
    await this.repository.fetchInspectAnnotations();
  }
}

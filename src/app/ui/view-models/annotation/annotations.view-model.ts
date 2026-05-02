import { inject, Injectable } from '@angular/core';
import { AnnotationRepository } from '../../../data/repositories/annotation/annotation-repository';

@Injectable({
  providedIn: 'root',
})
export class AnnotationsViewModel {
  private repository = inject(AnnotationRepository);

  public annotations = this.repository.annotations;
  public isLoading = this.repository.isLoading;
  public error = this.repository.error;

  public async loadAnnotations(): Promise<void> {
    await this.repository.fetchAnnotations();
  }
}

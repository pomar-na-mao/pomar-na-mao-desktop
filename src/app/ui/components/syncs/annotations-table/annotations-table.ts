import { Component, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import type { IAnnotation } from '../../../../domain/models/annotation.model';
import { AnnotationsViewModel } from '../../../view-models/annotation/annotations.view-model';

@Component({
  selector: 'app-annotations-table',
  imports: [CommonModule, DatePipe],
  templateUrl: './annotations-table.html',
  styleUrl: './annotations-table.scss',
})
export class AnnotationsTableComponent {
  private router = inject(Router);

  public annotationsViewModel = inject(AnnotationsViewModel);

  public sortedAnnotations = computed(() => {
    return [...this.annotationsViewModel.annotations()].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  });

  public getOccurrencesCount(annotation: IAnnotation): number {
    if (!annotation.occurrences) return 0;
    return Object.keys(annotation.occurrences).length;
  }

  public onEditAnnotation(id: string): void {
    this.router.navigate(['/sincronizacoes/anotacoes-de-inspecao', id]);
  }
}

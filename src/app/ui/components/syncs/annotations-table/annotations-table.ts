import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import type { IAnnotation } from '../../../../domain/models/annotation.model';
import { AnnotationsViewModel } from '../../../view-models/annotation/annotations.view-model';
import { AnnotationDetail } from '../../../views/annotation-detail/annotation-detail';

@Component({
  selector: 'app-annotations-table',
  imports: [CommonModule, DatePipe, AnnotationDetail],
  templateUrl: './annotations-table.html',
  styleUrl: './annotations-table.scss',
})
export class AnnotationsTableComponent {
  private router = inject(Router);

  public annotationsViewModel = inject(AnnotationsViewModel);

  public isModalOpen = signal(false);
  public selectedId = signal<string | null>(null);

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
    this.selectedId.set(id);
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedId.set(null);
  }
}

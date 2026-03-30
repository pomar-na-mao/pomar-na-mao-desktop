import { Component, input, computed, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import type { IInspectAnnotation } from '../../../../domain/models/inspect-annotation.model';

@Component({
  selector: 'app-inspect-annotations-table',
  imports: [CommonModule, TranslateModule, DatePipe],
  templateUrl: './inspect-annotations-table.html',
  styleUrl: './inspect-annotations-table.scss',
})
export class InspectAnnotationsTableComponent {
  private router = inject(Router);

  public annotations = input<IInspectAnnotation[]>([]);
  public isLoading = input<boolean>(false);

  public sortedAnnotations = computed(() => {
    return [...this.annotations()].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  });

  public getOccurrencesCount(annotation: IInspectAnnotation): number {
    if (!annotation.occurrences) return 0;
    return Object.keys(annotation.occurrences).length;
  }

  public onEditAnnotation(id: string): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes/anotacoes-de-inspecao', id]);
  }
}

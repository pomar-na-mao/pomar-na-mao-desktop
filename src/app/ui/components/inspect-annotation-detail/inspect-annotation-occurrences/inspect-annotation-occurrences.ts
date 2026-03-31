import { Component, computed, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { InspectAnnotationRepository } from '../../../../data/repositories/inspect-annotation/inspect-annotation-repository';
import { occurencesLabels } from '../../../../shared/utils/occurrences';
import type { IInspectAnnotation } from '../../../../domain/models/inspect-annotation.model';
import { InspectRoutineSyncViewModel } from '../../../view-models/inspect-routine/inspect-routine-sync.view-model';

@Component({
  selector: 'app-inspect-annotation-occurrences',
  imports: [CommonModule, TranslateModule],
  templateUrl: './inspect-annotation-occurrences.html',
  host: {
    style: 'display: contents',
  },
  providers: [InspectRoutineSyncViewModel],
})
export class InspectAnnotationOccurrences implements OnChanges {
  @Input() id!: string;

  private router = inject(Router);
  private inspectAnnotationRepository = inject(InspectAnnotationRepository);

  private currentId = signal<string | null>(null);

  public inspectRoutineSyncViewModel = inject(InspectRoutineSyncViewModel)

  public occurrencesLabels = occurencesLabels;

  public selectedAnnotation = computed<IInspectAnnotation | null>(() => {
    const id = this.currentId();
    if (!id) return null;

    return this.inspectAnnotationRepository.inspectAnnotations().find(annotation => annotation.id === id) ?? null;
  });

  public occurrenceKeys = computed<string[]>(() => {
    const occurrences = this.selectedAnnotation()?.occurrences;
    if (!occurrences) return [];

    return Object.entries(occurrences)
      .filter(([, value]) => value !== false && value !== null && value !== undefined)
      .map(([key]) => key);
  });

  public pendingCount = computed(() => (this.selectedAnnotation()?.is_approved ? 0 : 1));

  public async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['id'] && this.id) {
      this.currentId.set(this.id);
      await this.inspectAnnotationRepository.fetchInspectAnnotations();
    }
  }

  public goBack(): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes']);
  }
}

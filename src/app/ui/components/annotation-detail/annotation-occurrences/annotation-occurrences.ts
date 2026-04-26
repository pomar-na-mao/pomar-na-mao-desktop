import { Component, computed, inject, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnnotationRepository } from '../../../../data/repositories/annotation/annotation-repository';
import { MessageService } from '../../../../data/services/message/message.service';
import { occurencesLabels } from '../../../../shared/utils/occurrences';

@Component({
  selector: 'app-annotation-occurrences',
  imports: [CommonModule, TranslateModule],
  templateUrl: './annotation-occurrences.html',
  host: {
    style: 'display: contents',
  },
})
export class AnnotationOccurrences implements OnChanges {
  @Input() id!: string;

  private router = inject(Router);
  private annotationRepository = inject(AnnotationRepository);
  private messageService = inject(MessageService);

  public occurrencesLabels = occurencesLabels;

  public selectedAnnotation = this.annotationRepository.selectedAnnotation;
  public isLoading = this.annotationRepository.isLoading;
  public isApproving = signal(false);

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
      this.annotationRepository.setSelectedAnnotationId(this.id);
      await this.annotationRepository.fetchAnnotations();
    }
  }

  public async onApproveAnnotation(annotationId: string): Promise<void> {
    try {
      this.isApproving.set(true);
      const { error } = await this.annotationRepository.approveAnnotation(annotationId);
      if (error) throw error;

      await this.annotationRepository.fetchAnnotations();
      this.messageService.show('COMMON.TOAST.SUCCESS', 'success');
    } catch {
      this.messageService.show('COMMON.TOAST.ERROR', 'error');
    } finally {
      this.isApproving.set(false);
    }
  }

  public goBack(): void {
    this.router.navigate(['/pomar-na-mao/sincronizacoes']);
  }
}

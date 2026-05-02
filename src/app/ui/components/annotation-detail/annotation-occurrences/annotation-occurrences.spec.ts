import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnnotationRepository } from '../../../../data/repositories/annotation/annotation-repository';
import { MessageService } from '../../../../data/services/message/message.service';
import { AnnotationOccurrences } from './annotation-occurrences';

describe('AnnotationOccurrences', () => {
  let fixture: ComponentFixture<AnnotationOccurrences>;
  let component: AnnotationOccurrences;

  type SelectedAnnotation = {
    id: string;
    occurrences: Record<string, boolean | string | null | undefined>;
    is_approved: boolean;
  };

  const selectedAnnotation = signal<SelectedAnnotation>({
    id: 'annotation-123',
    occurrences: {
      aphid: true,
      mildew: false,
      rust: null,
      pruning: 'required'
    },
    is_approved: false
  });

  const mockAnnotationRepository = {
    selectedAnnotation,
    setSelectedAnnotationId: vi.fn(),
    fetchAnnotations: vi.fn().mockResolvedValue(undefined),
    isLoading: signal(false),
    approveAnnotation: vi.fn().mockResolvedValue({ data: 'ok', error: null }),
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockMessageService = {
    show: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    selectedAnnotation.set({
      id: 'annotation-123',
      occurrences: {
        aphid: true,
        mildew: false,
        rust: null,
        pruning: 'required'
      },
      is_approved: false
    });

    await TestBed.configureTestingModule({
      imports: [AnnotationOccurrences],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AnnotationRepository, useValue: mockAnnotationRepository },
        { provide: MessageService, useValue: mockMessageService },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AnnotationOccurrences);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose only enabled occurrence keys', () => {
    expect(component.occurrenceKeys()).toEqual(['aphid', 'pruning']);
  });

  it('should calculate the pending count from the approval status', () => {
    expect(component.pendingCount()).toBe(1);

    selectedAnnotation.set({
      id: 'annotation-123',
      occurrences: {
        aphid: true
      },
      is_approved: true
    });

    expect(component.pendingCount()).toBe(0);
  });

  it('should load annotations when the id changes', async () => {
    component.id = 'annotation-123';

    await component.ngOnChanges({
      id: {
        currentValue: 'annotation-123',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(mockAnnotationRepository.setSelectedAnnotationId).toHaveBeenCalledWith('annotation-123');
    expect(mockAnnotationRepository.fetchAnnotations).toHaveBeenCalled();
  });

  it('should navigate back to the sync list', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sincronizacoes']);
  });
});

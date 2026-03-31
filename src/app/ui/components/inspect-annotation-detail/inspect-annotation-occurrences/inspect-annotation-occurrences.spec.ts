import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectAnnotationRepository } from '../../../../data/repositories/inspect-annotation/inspect-annotation-repository';
import { InspectAnnotationOccurrences } from './inspect-annotation-occurrences';
import { InspectRoutineSyncViewModel } from '../../../view-models/inspect-routine/inspect-routine-sync.view-model';

describe('InspectAnnotationOccurrences', () => {
  let fixture: ComponentFixture<InspectAnnotationOccurrences>;
  let component: InspectAnnotationOccurrences;

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

  const mockInspectAnnotationRepository = {
    selectedAnnotation,
    setSelectedAnnotationId: vi.fn(),
    fetchInspectAnnotations: vi.fn().mockResolvedValue(undefined)
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockInspectRoutineSyncViewModel = {
    isLoading: vi.fn(() => false),
    isApproving: vi.fn(() => false),
    onApproveInspectAnnotation: vi.fn()
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
      imports: [InspectAnnotationOccurrences, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: InspectAnnotationRepository, useValue: mockInspectAnnotationRepository }
      ]
    })
      .overrideComponent(InspectAnnotationOccurrences, {
        set: {
          providers: [
            {
              provide: InspectRoutineSyncViewModel,
              useValue: mockInspectRoutineSyncViewModel
            }
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(InspectAnnotationOccurrences);
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

    expect(mockInspectAnnotationRepository.setSelectedAnnotationId).toHaveBeenCalledWith('annotation-123');
    expect(mockInspectAnnotationRepository.fetchInspectAnnotations).toHaveBeenCalled();
  });

  it('should navigate back to the sync list', () => {
    component.goBack();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/pomar-na-mao/sincronizacoes']);
  });
});

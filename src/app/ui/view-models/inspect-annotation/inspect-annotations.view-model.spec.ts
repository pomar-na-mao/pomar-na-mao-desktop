import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectAnnotationRepository } from '../../../data/repositories/inspect-annotation/inspect-annotation-repository';
import { InspectAnnotationsViewModel } from './inspect-annotations.view-model';

describe('InspectAnnotationsViewModel', () => {
  let viewModel: InspectAnnotationsViewModel;

  const annotationsSignal = signal([
    { id: 'annotation-1' }
  ]);
  const isLoadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  const mockRepository = {
    inspectAnnotations: annotationsSignal.asReadonly(),
    isLoading: isLoadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    fetchInspectAnnotations: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        InspectAnnotationsViewModel,
        { provide: InspectAnnotationRepository, useValue: mockRepository }
      ]
    });

    viewModel = TestBed.inject(InspectAnnotationsViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should expose repository state', () => {
    expect(viewModel.annotations()).toEqual([{ id: 'annotation-1' }]);
    expect(viewModel.isLoading()).toBe(false);
    expect(viewModel.error()).toBeNull();
  });

  it('should load annotations from the repository', async () => {
    await viewModel.loadAnnotations();

    expect(mockRepository.fetchInspectAnnotations).toHaveBeenCalled();
  });
});

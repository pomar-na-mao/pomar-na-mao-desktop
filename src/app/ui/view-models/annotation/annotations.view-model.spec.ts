import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AnnotationRepository } from '../../../data/repositories/annotation/annotation-repository';
import { AnnotationsViewModel } from './annotations.view-model';

describe('AnnotationsViewModel', () => {
  let viewModel: AnnotationsViewModel;

  const annotationsSignal = signal([
    { id: 'annotation-1' }
  ]);
  const isLoadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  const mockRepository = {
    annotations: annotationsSignal.asReadonly(),
    isLoading: isLoadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    fetchAnnotations: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AnnotationsViewModel,
        { provide: AnnotationRepository, useValue: mockRepository }
      ]
    });

    viewModel = TestBed.inject(AnnotationsViewModel);
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

    expect(mockRepository.fetchAnnotations).toHaveBeenCalled();
  });
});

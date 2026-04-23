import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkRoutineRepository } from '../../../data/repositories/work-routine/work-routine-repository';
import { WorkRoutinesViewModel } from './work-routines.view-model';

describe('WorkRoutinesViewModel', () => {
  let viewModel: WorkRoutinesViewModel;

  const routinesSignal = signal([
    { id: 1, date: '2026-03-01T10:00:00Z' },
    { id: 2, date: '2026-03-03T10:00:00Z' },
    { id: 3, date: null }
  ]);
  const isLoadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  const mockRepository = {
    workRoutines: routinesSignal,
    isLoading: isLoadingSignal,
    error: errorSignal,
    fetchWorkRoutines: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WorkRoutinesViewModel,
        { provide: WorkRoutineRepository, useValue: mockRepository }
      ]
    });

    viewModel = TestBed.inject(WorkRoutinesViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should sort routines by date descending', () => {
    expect(viewModel.sortedRoutines().map((routine) => routine.id)).toEqual([2, 1, 3]);
  });

  it('should load routines from the repository', async () => {
    await viewModel.loadRoutines();

    expect(mockRepository.fetchWorkRoutines).toHaveBeenCalled();
  });
});

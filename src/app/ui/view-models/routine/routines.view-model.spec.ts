import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutineRepository } from '../../../data/repositories/routine/routine-repository';
import { RoutinesViewModel } from './routines.view-model';

describe('RoutinesViewModel', () => {
  let viewModel: RoutinesViewModel;

  const routinesSignal = signal([
    { id: 1, date: '2026-03-01T10:00:00Z' },
    { id: 2, date: '2026-03-03T10:00:00Z' },
    { id: 3, date: null }
  ]);
  const isLoadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  const mockRepository = {
    routines: routinesSignal,
    isLoading: isLoadingSignal,
    error: errorSignal,
    fetchRoutines: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RoutinesViewModel,
        { provide: RoutineRepository, useValue: mockRepository }
      ]
    });

    viewModel = TestBed.inject(RoutinesViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should sort routines by date descending', () => {
    expect(viewModel.sortedRoutines().map((routine) => routine.id)).toEqual([2, 1, 3]);
  });

  it('should load routines from the repository', async () => {
    await viewModel.loadRoutines();

    expect(mockRepository.fetchRoutines).toHaveBeenCalled();
  });
});

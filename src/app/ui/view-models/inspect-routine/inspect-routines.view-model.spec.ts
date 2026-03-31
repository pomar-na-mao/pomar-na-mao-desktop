import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectRoutineRepository } from '../../../data/repositories/inspect-routine/inspect-routine-repository';
import { InspectRoutinesViewModel } from './inspect-routines.view-model';

describe('InspectRoutinesViewModel', () => {
  let viewModel: InspectRoutinesViewModel;

  const routinesSignal = signal([
    { id: 1, date: '2026-03-01T10:00:00Z' },
    { id: 2, date: '2026-03-03T10:00:00Z' },
    { id: 3, date: null }
  ]);
  const isLoadingSignal = signal(false);
  const errorSignal = signal<string | null>(null);

  const mockRepository = {
    inspectRoutines: routinesSignal,
    isLoading: isLoadingSignal,
    error: errorSignal,
    fetchInspectRoutines: vi.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        InspectRoutinesViewModel,
        { provide: InspectRoutineRepository, useValue: mockRepository }
      ]
    });

    viewModel = TestBed.inject(InspectRoutinesViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should sort routines by date descending', () => {
    expect(viewModel.sortedRoutines().map((routine) => routine.id)).toEqual([2, 1, 3]);
  });

  it('should load routines from the repository', async () => {
    await viewModel.loadRoutines();

    expect(mockRepository.fetchInspectRoutines).toHaveBeenCalled();
  });
});

import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkRoutineService } from '../../services/work-routine/work-routine-service';
import { WorkRoutineRepository } from './work-routine-repository';

describe('WorkRoutineRepository', () => {
  let repo: WorkRoutineRepository;

  const getWorkRoutines = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WorkRoutineRepository,
        {
          provide: WorkRoutineService,
          useValue: {
            getWorkRoutines
          }
        }
      ]
    });

    repo = TestBed.inject(WorkRoutineRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('fetchWorkRoutines should update state on success', async () => {
    const routines = [{ id: 1 }, { id: 2 }];
    getWorkRoutines.mockResolvedValue({ data: routines, error: null });

    await repo.fetchWorkRoutines();

    expect(repo.workRoutines()).toEqual(routines);
    expect(repo.error()).toBeNull();
    expect(repo.isLoading()).toBe(false);
  });

  it('fetchWorkRoutines should store an error on failure', async () => {
    getWorkRoutines.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.fetchWorkRoutines();

    expect(repo.error()).toContain('Error fetching work routines');
    expect(repo.isLoading()).toBe(false);
  });
});

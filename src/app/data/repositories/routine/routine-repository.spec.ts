import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutineService } from '../../services/routine/routine-service';
import { RoutineRepository } from './routine-repository';

describe('RoutineRepository', () => {
  let repo: RoutineRepository;

  const getRoutines = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RoutineRepository,
        {
          provide: RoutineService,
          useValue: {
            getRoutines
          }
        }
      ]
    });

    repo = TestBed.inject(RoutineRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('fetchRoutines should update state on success', async () => {
    const routines = [{ id: 1 }, { id: 2 }];
    getRoutines.mockResolvedValue({ data: routines, error: null });

    await repo.fetchRoutines();

    expect(repo.routines()).toEqual(routines);
    expect(repo.error()).toBeNull();
    expect(repo.isLoading()).toBe(false);
  });

  it('fetchRoutines should store an error on failure', async () => {
    getRoutines.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.fetchRoutines();

    expect(repo.error()).toContain('Error fetching routines');
    expect(repo.isLoading()).toBe(false);
  });
});

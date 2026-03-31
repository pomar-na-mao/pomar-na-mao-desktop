import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InspectRoutineService } from '../../services/inspect-routine/inspect-routine-service';
import { InspectRoutineRepository } from './inspect-routine-repository';

describe('InspectRoutineRepository', () => {
  let repo: InspectRoutineRepository;

  const getInspectRoutines = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        InspectRoutineRepository,
        {
          provide: InspectRoutineService,
          useValue: {
            getInspectRoutines
          }
        }
      ]
    });

    repo = TestBed.inject(InspectRoutineRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('fetchInspectRoutines should update state on success', async () => {
    const routines = [{ id: 1 }, { id: 2 }];
    getInspectRoutines.mockResolvedValue({ data: routines, error: null });

    await repo.fetchInspectRoutines();

    expect(repo.inspectRoutines()).toEqual(routines);
    expect(repo.error()).toBeNull();
    expect(repo.isLoading()).toBe(false);
  });

  it('fetchInspectRoutines should store an error on failure', async () => {
    getInspectRoutines.mockResolvedValue({ data: null, error: new Error('failed') });

    await repo.fetchInspectRoutines();

    expect(repo.error()).toContain('Error fetching inspect routines');
    expect(repo.isLoading()).toBe(false);
  });
});

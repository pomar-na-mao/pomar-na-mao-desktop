import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SprayingFlowRepository } from './spraying-flow-repository';
import { SprayingFlowService } from '../../services/spraying-flow/spraying-flow-service';

describe('SprayingFlowRepository', () => {
  let repository: SprayingFlowRepository;

  const getSessions = vi.fn();
  const getSessionVisualization = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        SprayingFlowRepository,
        {
          provide: SprayingFlowService,
          useValue: {
            getSessions,
            getSessionVisualization,
          },
        },
      ],
    });

    repository = TestBed.inject(SprayingFlowRepository);
  });

  it('should be created', () => {
    expect(repository).toBeTruthy();
  });

  it('fetchSessions should populate sessions and select the first session', async () => {
    const sessions = [{ id: 'session-1' }, { id: 'session-2' }];
    getSessions.mockResolvedValue({ data: sessions, error: null });
    const selectSessionSpy = vi.spyOn(repository, 'selectSession').mockResolvedValue(undefined);

    await repository.fetchSessions();

    expect(repository.sessions()).toEqual(sessions);
    expect(selectSessionSpy).toHaveBeenCalledWith('session-1');
    expect(repository.isLoadingSessions()).toBe(false);
  });

  it('fetchSessions should clear selected data when there are no sessions', async () => {
    repository.selectedSessionId.set('existing');
    repository.selectedVisualization.set({ session: { id: 'existing' }, routePoints: [], plants: [], products: [] } as never);
    getSessions.mockResolvedValue({ data: [], error: null });

    await repository.fetchSessions();

    expect(repository.selectedSessionId()).toBeNull();
    expect(repository.selectedVisualization()).toBeNull();
  });

  it('fetchSessions should store error on failure', async () => {
    getSessions.mockResolvedValue({ data: null, error: new Error('failed') });

    await repository.fetchSessions();

    expect(repository.error()).toContain('Error fetching spraying sessions');
    expect(repository.isLoadingSessions()).toBe(false);
  });

  it('selectSession should load visualization', async () => {
    const visualization = {
      session: { id: 'session-1' },
      routePoints: [{ id: 'r1' }],
      plants: [{ id: 'p1' }],
      products: [{ id: 'pr1' }],
    };
    getSessionVisualization.mockResolvedValue({ data: visualization, error: null });

    await repository.selectSession('session-1');

    expect(repository.selectedSessionId()).toBe('session-1');
    expect(repository.selectedVisualization()).toEqual(visualization);
    expect(repository.isLoadingVisualization()).toBe(false);
  });

  it('selectSession should store error on failure', async () => {
    getSessionVisualization.mockResolvedValue({ data: null, error: new Error('failed') });

    await repository.selectSession('session-1');

    expect(repository.selectedVisualization()).toBeNull();
    expect(repository.error()).toContain('Error fetching spraying session visualization');
  });

  it('refreshSelectedSession should reload current selection', async () => {
    repository.selectedSessionId.set('session-9');
    const selectSessionSpy = vi.spyOn(repository, 'selectSession').mockResolvedValue(undefined);

    await repository.refreshSelectedSession();

    expect(selectSessionSpy).toHaveBeenCalledWith('session-9');
  });
});

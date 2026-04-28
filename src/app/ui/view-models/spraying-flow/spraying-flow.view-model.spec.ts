import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SprayingFlowRepository } from '../../../data/repositories/spraying-flow/spraying-flow-repository';
import { SprayingFlowViewModel } from './spraying-flow.view-model';

describe('SprayingFlowViewModel', () => {
  let viewModel: SprayingFlowViewModel;

  const sessions = signal([{ id: 'session-1' }, { id: 'session-2' }]);
  const selectedSessionId = signal<string | null>('session-1');
  const selectedVisualization = signal({
    session: { id: 'session-1' },
    routePoints: [{ id: 'route-1' }, { id: 'route-2' }],
    plants: [{ id: 'plant-1' }],
    products: [{ id: 'product-1' }, { id: 'product-2' }],
  });
  const isLoadingSessions = signal(false);
  const isLoadingVisualization = signal(false);
  const error = signal<string | null>(null);

  const mockRepository = {
    sessions,
    selectedSessionId,
    selectedVisualization,
    isLoadingSessions,
    isLoadingVisualization,
    error,
    fetchSessions: vi.fn().mockResolvedValue(undefined),
    selectSession: vi.fn().mockResolvedValue(undefined),
    refreshSelectedSession: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        SprayingFlowViewModel,
        { provide: SprayingFlowRepository, useValue: mockRepository },
      ],
    });

    viewModel = TestBed.inject(SprayingFlowViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should expose computed totals', () => {
    expect(viewModel.totalSessions()).toBe(2);
    expect(viewModel.totalRoutePoints()).toBe(2);
    expect(viewModel.totalPlants()).toBe(1);
    expect(viewModel.totalProducts()).toBe(2);
    expect(viewModel.selectedSession()?.id).toBe('session-1');
  });

  it('should load sessions through repository', async () => {
    await viewModel.loadSessions();
    expect(mockRepository.fetchSessions).toHaveBeenCalled();
  });

  it('should select session through repository', async () => {
    await viewModel.selectSession('session-2');
    expect(mockRepository.selectSession).toHaveBeenCalledWith('session-2');
  });

  it('should refresh selected session through repository', async () => {
    await viewModel.refreshSelectedSession();
    expect(mockRepository.refreshSelectedSession).toHaveBeenCalled();
  });
});

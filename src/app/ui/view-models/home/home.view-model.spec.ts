import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PlantsRepository } from '../../../data/repositories/plants/plants-repository';
import { HomeViewModel } from './home.view-model';

describe('HomeViewModel', () => {
  let viewModel: HomeViewModel;

  const mockPlantsRepository = {
    getHomeStats: vi.fn(),
    getRecentUpdates: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        HomeViewModel,
        { provide: PlantsRepository, useValue: mockPlantsRepository }
      ]
    });

    viewModel = TestBed.inject(HomeViewModel);
  });

  it('should create', () => {
    expect(viewModel).toBeTruthy();
  });

  it('should calculate percentages as zero when there are no plants', () => {
    expect(viewModel.vigorPercent()).toBe(0);
    expect(viewModel.progressPercent()).toBe(0);
  });

  it('should initialize stats and recent updates', async () => {
    mockPlantsRepository.getHomeStats.mockResolvedValue({
      total_plants: 100,
      alive_plants: 80,
      updated_plants: 55,
      latest_updated_at: '2026-03-31T10:00:00Z'
    });
    mockPlantsRepository.getRecentUpdates.mockResolvedValue([
      { id: 'plant-1', updated_at: '2026-03-31T10:00:00Z' }
    ]);

    await viewModel.initialize();

    expect(viewModel.totalPlants()).toBe(100);
    expect(viewModel.alivePlants()).toBe(80);
    expect(viewModel.updatedPlants()).toBe(55);
    expect(viewModel.latestUpdatedAt()).toBe('2026-03-31T10:00:00Z');
    expect(viewModel.recentUpdates()).toEqual([{ id: 'plant-1', updated_at: '2026-03-31T10:00:00Z' }]);
    expect(viewModel.vigorPercent()).toBe(80);
    expect(viewModel.progressPercent()).toBe(55);
    expect(viewModel.hasError()).toBe(false);
    expect(viewModel.isLoading()).toBe(false);
  });

  it('should set the error flag when initialization fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPlantsRepository.getHomeStats.mockRejectedValueOnce(new Error('failed'));

    await viewModel.initialize();

    expect(viewModel.hasError()).toBe(true);
    expect(viewModel.isLoading()).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should refresh recent updates', async () => {
    mockPlantsRepository.getRecentUpdates.mockResolvedValue([
      { id: 'plant-2', updated_at: '2026-03-31T11:00:00Z' }
    ]);

    await viewModel.refreshRecentUpdates();

    expect(mockPlantsRepository.getRecentUpdates).toHaveBeenCalled();
    expect(viewModel.recentUpdates()).toEqual([{ id: 'plant-2', updated_at: '2026-03-31T11:00:00Z' }]);
    expect(viewModel.isLoading()).toBe(false);
  });
});

import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeDashboardRepository } from '../../../data/repositories/home-dashboard/home-dashboard-repository';
import { DashboardViewModel } from './dashboard.view-model';

describe('DashboardViewModel', () => {
  let viewModel: DashboardViewModel;

  const getSnapshot = vi.fn();
  const getFilterOptions = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    getSnapshot.mockResolvedValue({
      summary: {
        totalPlants: 12,
        totalZones: 3,
        totalOccurrenceTypes: 7,
        totalVarieties: 2,
        varieties: [
          { id: 1, name: 'Gala' },
          { id: 2, name: 'Fuji' },
        ],
      },
      plants: [
        { id: 'p1', latitude: -21.1, longitude: -47.1, varietyId: 1, varietyName: 'Gala' },
        { id: 'p2', latitude: -21.2, longitude: -47.2, varietyId: null, varietyName: null },
      ],
    });

    getFilterOptions.mockResolvedValue({
      zones: [
        { id: 'z1', name: 'Zona A' },
        { id: 'z2', name: 'Zona B' },
      ],
      occurrences: [
        { id: 'o1', name: 'Broca' },
        { id: 'o2', name: 'Formigueiro' },
      ],
    });

    TestBed.configureTestingModule({
      providers: [
        DashboardViewModel,
        {
          provide: HomeDashboardRepository,
          useValue: {
            getSnapshot,
            getFilterOptions,
          },
        },
      ],
    });

    viewModel = TestBed.inject(DashboardViewModel);
  });

  it('should load dashboard snapshot and filter options on initialization', async () => {
    await viewModel.loadDashboard();

    expect(getSnapshot).toHaveBeenCalled();
    expect(getFilterOptions).toHaveBeenCalled();
    expect(viewModel.plottedPlantsCount()).toBe(2);
    expect(viewModel.availableZones().length).toBe(2);
    expect(viewModel.availableOccurrences().length).toBe(2);
  });

  it('should expose available varieties from summary', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.availableVarieties()).toEqual([
      { id: 1, name: 'Gala' },
      { id: 2, name: 'Fuji' },
    ]);
  });

  it('should filter plants by variety when filterVarietyId is set', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.filteredPlants().length).toBe(2);

    viewModel.filterVarietyId.set('1');
    expect(viewModel.filteredPlants().length).toBe(1);
    expect(viewModel.filteredPlants()[0].id).toBe('p1');
  });

  it('should build variety legend with fallback for plants without variety', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.varietyLegend()).toEqual([
      { label: 'Gala', color: '#0f766e', varietyId: 1 },
      { label: 'Fuji', color: '#1d4ed8', varietyId: 2 },
      { label: 'Sem variedade', color: '#16a34a', varietyId: null },
    ]);
    expect(viewModel.getVarietyColor(1, 'Coracao')).toBe('#0f766e');
    expect(viewModel.getVarietyColor(null, null)).toBe('#16a34a');
  });

  it('should use normalized variety name when id is not available', async () => {
    await viewModel.loadDashboard();

    expect(viewModel.getVarietyColor(null, ' gala ')).toBe('#0f766e');
  });

  it('should use pink for classica varieties', async () => {
    getSnapshot.mockResolvedValueOnce({
      summary: {
        totalPlants: 12,
        totalZones: 3,
        totalOccurrenceTypes: 7,
        totalVarieties: 1,
        varieties: [{ id: 9, name: 'Classica' }],
      },
      plants: [
        { id: 'p9', latitude: -21.1, longitude: -47.1, varietyId: 9, varietyName: 'Classica' },
      ],
    });

    await viewModel.loadDashboard();

    expect(viewModel.varietyLegend()).toEqual([
      { label: 'Classica', color: '#ec4899', varietyId: 9 },
    ]);
    expect(viewModel.getVarietyColor(9, 'Classica')).toBe('#ec4899');
  });
});

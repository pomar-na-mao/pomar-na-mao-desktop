import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeDashboardService } from '../../services/home-dashboard/home-dashboard-service';
import { HomeDashboardRepository } from './home-dashboard-repository';

describe('HomeDashboardRepository', () => {
  let repository: HomeDashboardRepository;

  const getSnapshot = vi.fn();
  const getFilterOptions = vi.fn();
  const getOpenOccurrences = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        HomeDashboardRepository,
        {
          provide: HomeDashboardService,
          useValue: {
            getSnapshot,
            getFilterOptions,
            getOpenOccurrences,
          },
        },
      ],
    });

    repository = TestBed.inject(HomeDashboardRepository);
  });

  it('should delegate snapshot loading', async () => {
    getSnapshot.mockResolvedValue({
      summary: { totalPlants: 1, totalZones: 2, totalOccurrenceTypes: 3, totalVarieties: 4, varieties: [] },
      plants: [],
    });

    const result = await repository.getSnapshot();

    expect(result.summary.totalPlants).toBe(1);
    expect(getSnapshot).toHaveBeenCalled();
  });

  it('should delegate filter options loading', async () => {
    getFilterOptions.mockResolvedValue({
      zones: [{ id: 'z1', name: 'Zona A', polygon: null }],
      occurrences: [{ id: 'o1', name: 'Broca' }],
    });

    const result = await repository.getFilterOptions();

    expect(result.zones.length).toBe(1);
    expect(result.occurrences.length).toBe(1);
    expect(getFilterOptions).toHaveBeenCalled();
  });

  it('should delegate open occurrences loading', async () => {
    getOpenOccurrences.mockResolvedValue([
      { plant_id: 'p1', occurrence_type_id: 'o1' }
    ]);

    const result = await repository.getOpenOccurrences();

    expect(result.length).toBe(1);
    expect(result[0].plant_id).toBe('p1');
    expect(getOpenOccurrences).toHaveBeenCalled();
  });
});

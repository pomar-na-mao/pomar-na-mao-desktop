import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegionsRepository } from '../regions/regions-repository';
import { HomeDashboardService } from '../../services/home-dashboard/home-dashboard-service';
import { HomeDashboardRepository } from './home-dashboard-repository';

describe('HomeDashboardRepository', () => {
  let repository: HomeDashboardRepository;

  const getHomeDashboardData = vi.fn();
  const getFilterOptions = vi.fn();
  const getOpenOccurrences = vi.fn();
  const findByZoneId = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        HomeDashboardRepository,
        {
          provide: HomeDashboardService,
          useValue: {
            getHomeDashboardData,
            getFilterOptions,
            getOpenOccurrences,
          },
        },
        {
          provide: RegionsRepository,
          useValue: {
            findByZoneId,
          },
        },
      ],
    });

    repository = TestBed.inject(HomeDashboardRepository);
  });

  it('should delegate snapshot loading', async () => {
    getHomeDashboardData.mockResolvedValue({
      summary: {
        totalPlants: 1,
        totalZones: 2,
        totalOccurrenceTypes: 3,
        totalVarieties: 4,
        varieties: [],
      },
      plants: [],
    });

    const filters = {
      plantingStartDate: null,
      plantingEndDate: null,
    } as const;
    const result = await repository.getHomeDashboardData(filters);

    expect(result.summary.totalPlants).toBe(1);
    expect(getHomeDashboardData).toHaveBeenCalledWith(filters, undefined);
  });

  it('should forward the cache-miss callback', async () => {
    const onCacheMiss = vi.fn();
    getHomeDashboardData.mockImplementation(
      async (_filters, callback?: () => void) => {
        callback?.();
        return {
          summary: {
            totalPlants: 1,
            totalZones: 2,
            totalOccurrenceTypes: 3,
            totalVarieties: 4,
            varieties: [],
          },
          plants: [],
          farmBoundary: [],
        };
      },
    );

    await repository.getHomeDashboardData(
      { plantingStartDate: null, plantingEndDate: null },
      onCacheMiss,
    );

    expect(onCacheMiss).toHaveBeenCalledTimes(1);
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
      { plant_id: 'p1', occurrence_type_id: 'o1' },
    ]);

    const result = await repository.getOpenOccurrences();

    expect(result.length).toBe(1);
    expect(result[0].plant_id).toBe('p1');
    expect(getOpenOccurrences).toHaveBeenCalled();
  });

  it('should delegate selected zone region loading', async () => {
    findByZoneId.mockResolvedValue({
      data: [
        {
          id: 'r1',
          created_at: '2026-01-01T00:00:00Z',
          latitude: -21.1,
          longitude: -47.1,
          region: 'A',
          zone_id: 'z1',
          order: 1,
        },
      ],
      error: null,
    });

    const result = await repository.getZoneRegions('z1');

    expect(findByZoneId).toHaveBeenCalledWith('z1');
    expect(result[0].order).toBe(1);
  });

  it('should throw when selected zone region loading fails', async () => {
    const error = new Error('failed');
    findByZoneId.mockResolvedValue({ data: [], error });

    await expect(repository.getZoneRegions('z1')).rejects.toBe(error);
  });
});

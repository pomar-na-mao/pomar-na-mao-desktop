import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import type { PostgrestError } from '@supabase/supabase-js';
import { FieldActivitiesRepository } from './field-activities.repository';
import { FieldActivitiesService } from '../../services/field-activities/field-activities.service';
import type { FieldActivityItem } from '../../../domain/models/field-activity.model';

describe('FieldActivitiesRepository', () => {
  let repository: FieldActivitiesRepository;
  const mockGetFieldActivities = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        FieldActivitiesRepository,
        {
          provide: FieldActivitiesService,
          useValue: {
            getFieldActivities: mockGetFieldActivities,
          },
        },
      ],
    });

    repository = TestBed.inject(FieldActivitiesRepository);
  });

  it('should be created with initial empty activities', () => {
    expect(repository).toBeTruthy();
    expect(repository.activities()).toEqual([]);
  });

  it('should fetch activities and update signal', async () => {
    const mockData: FieldActivityItem[] = [
      {
        id: 'act-1',
        field_operation_id: 'op-1',
        activity: 'Roçagem',
        responsible: 'Lucas',
        performed_at: '2026-10-28T23:38:00.000Z',
        geometry_type: 'route',
        geometry_geojson: { type: 'LineString', coordinates: [[-47.79, -21.23], [-47.791, -21.235]] },
        mixture_id: null,
        mixture_name: null,
        device_id: 'dev-1',
        local_id: 'loc-1',
        created_at: '2026-10-28T23:38:33.000Z',
        updated_at: '2026-10-28T23:38:33.000Z',
        inputs: [],
      },
    ];

    mockGetFieldActivities.mockResolvedValue({
      data: mockData,
      error: null,
      count: 1,
      status: 200,
      statusText: 'OK',
    });

    const result = await repository.findAll('2026-10-01', '2026-10-31');

    expect(result.error).toBeNull();
    expect(repository.activities()).toEqual(mockData);
    expect(mockGetFieldActivities).toHaveBeenCalledWith('2026-10-01', '2026-10-31');
  });

  it('should clear activities and return error when fetch fails', async () => {
    const mockError = { message: 'Network error' } as PostgrestError;
    mockGetFieldActivities.mockResolvedValue({
      data: null,
      error: mockError,
      count: null,
      status: 500,
      statusText: 'Error',
    });

    const result = await repository.findAll();

    expect(result.error).toEqual(mockError);
    expect(repository.activities()).toEqual([]);
  });
});

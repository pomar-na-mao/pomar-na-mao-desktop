import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { HomeDashboardService } from './home-dashboard-service';

describe('HomeDashboardService', () => {
  let service: HomeDashboardService;
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        HomeDashboardService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ rpc: mockRpc }) as Partial<SupabaseClient> as SupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(HomeDashboardService);
  });

  it('should return dashboard snapshot from a single rpc call', async () => {
    mockRpc.mockResolvedValue({
      data: {
        summary: {
          totalPlants: 12,
          totalZones: 3,
          totalOccurrenceTypes: 7,
          totalVarieties: 2,
          varieties: [
            { id: 2, name: 'Fuji' },
            { id: 1, name: 'Gala' },
          ],
        },
        plants: [
          {
            id: 'p1',
            latitude: -21.1,
            longitude: -47.1,
            varietyId: 1,
            varietyName: 'Gala',
          },
          {
            id: 'p2',
            latitude: -21.2,
            longitude: -47.2,
            varietyId: null,
            varietyName: null,
          },
        ],
      },
      error: null,
    });

    const result = await service.getSnapshot();

    expect(mockRpc).toHaveBeenCalledWith('get_home_dashboard_snapshot', {
      p_period_start_date: null,
      p_period_end_date: null,
      p_planting_start_date: null,
      p_planting_end_date: null,
      p_operation_code: null,
    });
    expect(result).toEqual({
      summary: {
        totalPlants: 12,
        totalZones: 3,
        totalOccurrenceTypes: 7,
        totalVarieties: 2,
        varieties: [
          { id: 2, name: 'Fuji' },
          { id: 1, name: 'Gala' },
        ],
      },
      plants: [
        {
          id: 'p1',
          latitude: -21.1,
          longitude: -47.1,
          varietyId: 1,
          varietyName: 'Gala',
        },
        {
          id: 'p2',
          latitude: -21.2,
          longitude: -47.2,
          varietyId: null,
          varietyName: null,
        },
      ],
    });
  });

  it('should ignore invalid map points and default empty values', async () => {
    mockRpc.mockResolvedValue({
      data: {
        summary: {
          totalPlants: null,
          totalZones: null,
          totalOccurrenceTypes: null,
          totalVarieties: null,
          varieties: null,
        },
        plants: [
          {
            id: 'p1',
            latitude: null,
            longitude: -47.1,
            varietyId: 1,
            varietyName: 'Gala',
          },
          {
            id: 'p2',
            latitude: -21.2,
            longitude: -47.2,
            varietyId: null,
            varietyName: null,
          },
        ],
      },
      error: null,
    });

    const result = await service.getSnapshot();

    expect(result).toEqual({
      summary: {
        totalPlants: 0,
        totalZones: 0,
        totalOccurrenceTypes: 0,
        totalVarieties: 0,
        varieties: [],
      },
      plants: [
        {
          id: 'p2',
          latitude: -21.2,
          longitude: -47.2,
          varietyId: null,
          varietyName: null,
        },
      ],
    });
  });

  it('should forward snapshot filter params to the rpc', async () => {
    mockRpc.mockResolvedValue({
      data: { summary: null, plants: [] },
      error: null,
    });

    await service.getSnapshot({
      plantingStartDate: '2026-01-01',
      plantingEndDate: '2026-02-01',
    });

    expect(mockRpc).toHaveBeenLastCalledWith('get_home_dashboard_snapshot', {
      p_period_start_date: null,
      p_period_end_date: null,
      p_planting_start_date: '2026-01-01',
      p_planting_end_date: '2026-02-01',
      p_operation_code: null,
    });
  });
});

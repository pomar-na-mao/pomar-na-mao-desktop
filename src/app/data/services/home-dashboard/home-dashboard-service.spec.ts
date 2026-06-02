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

    expect(mockRpc).toHaveBeenCalledWith('get_home_dashboard_snapshot');
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
});

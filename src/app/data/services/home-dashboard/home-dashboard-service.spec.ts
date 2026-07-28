import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { HomeDashboardService } from './home-dashboard-service';

describe('HomeDashboardService', () => {
  let service: HomeDashboardService;
  const mockRpc = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        HomeDashboardService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () =>
              ({
                rpc: mockRpc,
                from: mockFrom,
              }) as Partial<SupabaseClient> as SupabaseClient,
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

    const result = await service.getHomeDashboardData();
    const cachedResult = await service.getHomeDashboardData();

    expect(mockRpc).toHaveBeenCalledWith('get_home_dashboard_snapshot', {
      p_period_start_date: null,
      p_period_end_date: null,
      p_planting_start_date: null,
      p_planting_end_date: null,
      p_operation_code: null,
    });
    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(cachedResult).toEqual(result);
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

    const result = await service.getHomeDashboardData();

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

    await service.getHomeDashboardData({
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

  it('should cache dashboard reference options across loads', async () => {
    const zoneOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'z1', name: 'Zona A', polygon: null }],
      error: null,
    });
    const occurrenceOrder = vi.fn().mockResolvedValue({
      data: [{ id: 'o1', name: 'Broca' }],
      error: null,
    });
    mockFrom.mockImplementation((table: string) => ({
      select: vi.fn().mockReturnValue({
        order: table === 'zones' ? zoneOrder : occurrenceOrder,
      }),
    }));

    const first = await service.getFilterOptions();
    const second = await service.getFilterOptions();

    expect(first).toEqual(second);
    expect(mockFrom).toHaveBeenCalledTimes(2);
    expect(zoneOrder).toHaveBeenCalledTimes(1);
    expect(occurrenceOrder).toHaveBeenCalledTimes(1);
  });

  it('should reuse open occurrences during the TTL window', async () => {
    mockRpc.mockResolvedValue({
      data: [{ plant_id: 'p1', occurrence_type_id: 'o1' }],
      error: null,
    });

    await service.getOpenOccurrences();
    await service.getOpenOccurrences();

    expect(mockRpc).toHaveBeenCalledTimes(1);
    expect(mockRpc).toHaveBeenCalledWith('get_open_occurrences');
  });
});

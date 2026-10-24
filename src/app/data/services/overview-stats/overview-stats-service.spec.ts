import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OverviewStatsService } from './overview-stats-service';
import { SupabaseService } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('OverviewStatsService', () => {
  let service: OverviewStatsService;
  const mockInvoke = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      functions: { invoke: mockInvoke },
    } as unknown as SupabaseClient;

    TestBed.configureTestingModule({
      providers: [
        OverviewStatsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(OverviewStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOverviewStats', () => {
    it('should return stats from the edge function on success', async () => {
      const stats = {
        total_plants: 100,
        alive_plants: 90,
        updated_plants: 70,
        latest_updated_at: '2026-03-25T00:00:00Z',
      };
      mockInvoke.mockResolvedValue({ data: { status: 'ok', data: stats }, error: null });

      const result = await service.getOverviewStats();
      const cachedResult = await service.getOverviewStats();

      expect(mockInvoke).toHaveBeenCalledWith('get-home-stats');
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      expect(result).toEqual(stats);
      expect(cachedResult).toEqual(stats);
    });

    it('should throw error on network failure', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: { message: 'Network error' } });

      await expect(service.getOverviewStats()).rejects.toThrowError('Network error');
    });

    it('should throw error when status is not ok', async () => {
      mockInvoke.mockResolvedValue({ data: { status: 'error', data: null }, error: null });

      await expect(service.getOverviewStats()).rejects.toThrowError('error');
    });
  });
});

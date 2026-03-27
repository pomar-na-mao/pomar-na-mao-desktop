import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HomeStatsService } from './home-stats-service';
import { SupabaseService } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('HomeStatsService', () => {
  let service: HomeStatsService;
  const mockInvoke = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      functions: { invoke: mockInvoke },
    } as unknown as SupabaseClient;

    TestBed.configureTestingModule({
      providers: [
        HomeStatsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(HomeStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHomeStats', () => {
    it('should return stats from the edge function on success', async () => {
      const stats = {
        total_plants: 100,
        alive_plants: 90,
        updated_plants: 70,
        latest_updated_at: '2026-03-25T00:00:00Z',
      };
      mockInvoke.mockResolvedValue({ data: { status: 'ok', data: stats }, error: null });

      const result = await service.getHomeStats();

      expect(mockInvoke).toHaveBeenCalledWith('get-home-stats');
      expect(result).toEqual(stats);
    });

    it('should throw error on network failure', async () => {
      mockInvoke.mockResolvedValue({ data: null, error: { message: 'Network error' } });

      await expect(service.getHomeStats()).rejects.toThrowError('Network error');
    });

    it('should throw error when status is not ok', async () => {
      mockInvoke.mockResolvedValue({ data: { status: 'error', data: null }, error: null });

      await expect(service.getHomeStats()).rejects.toThrowError('error');
    });
  });
});

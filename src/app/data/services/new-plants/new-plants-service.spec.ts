import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { NewPlantsService } from './new-plants-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';

describe('NewPlantsService', () => {
  let service: NewPlantsService;
  const mockFrom = vi.fn();
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      from: mockFrom,
      rpc: mockRpc,
    } as Partial<SupabaseClient>;

    TestBed.configureTestingModule({
      providers: [
        NewPlantsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient as SupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(NewPlantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNewPlants', () => {
    it('should query new_plants table ordered by created_at', async () => {
      const mockResponse = { data: [], error: null };
      const order = vi.fn().mockResolvedValue(mockResponse);
      const select = vi.fn().mockReturnValue({ order });
      mockFrom.mockReturnValue({ select });

      const result = await service.getNewPlants();

      expect(mockFrom).toHaveBeenCalledWith('new_plants');
      expect(select).toHaveBeenCalledWith('*');
      expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toBe(mockResponse);
    });
  });

  describe('approveNewPlant', () => {
    it('should call approve_new_plant RPC with correct id', async () => {
      const mockResponse = { data: null, error: null };
      mockRpc.mockResolvedValue(mockResponse);

      const result = await service.approveNewPlant('test-id');

      expect(mockRpc).toHaveBeenCalledWith('approve_new_plant', {
        p_new_plant_id: 'test-id'
      });
      expect(result).toBe(mockResponse);
    });
  });
});

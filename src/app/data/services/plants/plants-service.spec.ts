import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PlantsService } from './plants-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';
import type { PlantInsert } from '../../../domain/models/plant-data.model';

describe('PlantsService', () => {
  let service: PlantsService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      from: mockFrom,
    } as Partial<SupabaseClient>;

    TestBed.configureTestingModule({
      providers: [
        PlantsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient as SupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(PlantsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call select and order with no filters', async () => {
      const mockResponse = { data: [], error: null };
      const order = vi.fn().mockResolvedValue(mockResponse);
      const select = vi.fn().mockReturnValue({ order });
      mockFrom.mockReturnValue({ select });

      const result = await service.findAll(null);

      expect(mockFrom).toHaveBeenCalledWith('plants');
      expect(select).toHaveBeenCalledWith('*');
      expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toBe(mockResponse);
    });

    it('should apply region and occurrence filters', async () => {
      const mockResponse = { data: [], error: null };
      const eq2 = vi.fn().mockResolvedValue(mockResponse);
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const order = vi.fn().mockReturnValue({ eq: eq1 });
      const select = vi.fn().mockReturnValue({ order });
      mockFrom.mockReturnValue({ select });

      const filters = { region: 'North', occurrence: 'flowers' };
      await service.findAll(filters);

      expect(eq1).toHaveBeenCalledWith('region', 'North');
      expect(eq2).toHaveBeenCalledWith('flowers', true);
    });

    it('should apply variety filter', async () => {
      const mockResponse = { data: [], error: null };
      const eq3 = vi.fn().mockResolvedValue(mockResponse);
      const eq2 = vi.fn().mockReturnValue({ eq: eq3 });
      const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
      const order = vi.fn().mockReturnValue({ eq: eq1 });
      const select = vi.fn().mockReturnValue({ order });
      mockFrom.mockReturnValue({ select });

      const filters = { region: 'North', occurrence: 'flowers', variety: 'Gala' };
      await service.findAll(filters);

      expect(eq1).toHaveBeenCalledWith('region', 'North');
      expect(eq2).toHaveBeenCalledWith('flowers', true);
      expect(eq3).toHaveBeenCalledWith('variety', 'Gala');
    });
  });

  describe('findById', () => {
    it('should query by id and return single', async () => {
      const mockResponse = { data: { id: '1' }, error: null };
      const single = vi.fn().mockResolvedValue(mockResponse);
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ select });

      const result = await service.findById('1');

      expect(eq).toHaveBeenCalledWith('id', '1');
      expect(single).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });
  });

  describe('delete', () => {
    it('should call delete and eq', async () => {
      const mockResponse = { data: null, error: null };
      const eq = vi.fn().mockResolvedValue(mockResponse);
      const deleteMock = vi.fn().mockReturnValue({ eq });
      mockFrom.mockReturnValue({ delete: deleteMock });

      const result = await service.delete('1');

      expect(deleteMock).toHaveBeenCalled();
      expect(eq).toHaveBeenCalledWith('id', '1');
      expect(result).toBe(mockResponse);
    });
  });

  describe('insert', () => {
    it('should call insert, select, and single', async () => {
      const plant = { id: '1', variety: 'Apple' } as PlantInsert;
      const mockResponse = { data: plant, error: null };
      const single = vi.fn().mockResolvedValue(mockResponse);
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });
      mockFrom.mockReturnValue({ insert });

      const result = await service.insert(plant);

      expect(insert).toHaveBeenCalledWith([plant]);
      expect(select).toHaveBeenCalled();
      expect(single).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });
  });
});

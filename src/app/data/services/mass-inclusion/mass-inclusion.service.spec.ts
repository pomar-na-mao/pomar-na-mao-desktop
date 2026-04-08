import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MassInclusionService } from './mass-inclusion.service';
import { SupabaseService } from '../supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MassUpdatePlantsParams } from '../../../domain/models/mass-inclusion';

describe('MassInclusionService', () => {
  let service: MassInclusionService;
  const mockRpc = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      rpc: mockRpc,
    } as Partial<SupabaseClient>;

    TestBed.configureTestingModule({
      providers: [
        MassInclusionService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => mockSupabaseClient as SupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(MassInclusionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('massUpdatePlantsInPolygon', () => {
    const coords = [
      { lat: -21.23, lng: -47.79 },
      { lat: -21.24, lng: -47.78 },
      { lat: -21.25, lng: -47.80 },
    ];

    it('should call the rpc with correct mapped params', async () => {
      const mockResult = { message: 'ok', updated: 2, ids: ['a', 'b'] };
      mockRpc.mockResolvedValue({ data: mockResult, error: null });

      const params: MassUpdatePlantsParams = {
        coordinates: coords,
        occurrences: ['mites'],
        variety: 'Coração',
        lifeOfTree: '5 anos',
        plantingDate: '2020-01-01',
        description: 'Teste',
      };

      const result = await service.massUpdatePlantsInPolygon(params);

      expect(mockRpc).toHaveBeenCalledWith('mass_update_plants_in_polygon', {
        coordinates: coords,
        occurrences: ['mites'],
        variety: 'Coração',
        life_of_tree_param: '5 anos',
        planting_date_param: '2020-01-01',
        description_param: 'Teste',
      });
      expect(result.data).toEqual(mockResult);
      expect(result.error).toBeNull();
    });

    it('should default null optional params when not provided', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null });

      await service.massUpdatePlantsInPolygon({ coordinates: coords });

      expect(mockRpc).toHaveBeenCalledWith('mass_update_plants_in_polygon', {
        coordinates: coords,
        occurrences: [],
        variety: null,
        life_of_tree_param: null,
        planting_date_param: null,
        description_param: null,
      });
    });

    it('should return error when rpc fails', async () => {
      const mockError = { message: 'syntax error' };
      mockRpc.mockResolvedValue({ data: null, error: mockError });

      const result = await service.massUpdatePlantsInPolygon({ coordinates: coords });

      expect(result.error).toEqual(mockError);
      expect(result.data).toBeNull();
    });
  });
});

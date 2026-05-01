import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { RegionsService } from './regions-service';

describe('RegionsService', () => {
  let service: RegionsService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        RegionsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }) as Partial<SupabaseClient> as SupabaseClient
          }
        }
      ]
    });

    service = TestBed.inject(RegionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll should query all regions ordered by name', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.findAll();

    expect(mockFrom).toHaveBeenCalledWith('regions');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('region');
    expect(result).toBe(mockResponse);
  });

  it('findById should query a single region by id', async () => {
    const mockResponse = { data: { id: 'region-1' }, error: null };
    const single = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.findById('region-1');

    expect(eq).toHaveBeenCalledWith('id', 'region-1');
    expect(single).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });
});

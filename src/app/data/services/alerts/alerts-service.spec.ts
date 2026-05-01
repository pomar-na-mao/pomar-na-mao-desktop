import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { AlertsService } from './alerts-service';

describe('AlertsService', () => {
  let service: AlertsService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        AlertsService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }) as Partial<SupabaseClient> as SupabaseClient
          }
        }
      ]
    });

    service = TestBed.inject(AlertsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('findAll should query active alerts ordered by creation date', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.findAll();

    expect(mockFrom).toHaveBeenCalledWith('alerts');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('is_active', true);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toBe(mockResponse);
  });

  it('findById should query a single alert by id', async () => {
    const mockResponse = { data: { id: 'alert-1' }, error: null };
    const single = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.findById('alert-1');

    expect(eq).toHaveBeenCalledWith('id', 'alert-1');
    expect(single).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });
});

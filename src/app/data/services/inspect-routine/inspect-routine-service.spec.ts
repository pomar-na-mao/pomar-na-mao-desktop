import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { InspectRoutineService } from './inspect-routine-service';

describe('InspectRoutineService', () => {
  let service: InspectRoutineService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        InspectRoutineService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }) as Partial<SupabaseClient> as SupabaseClient
          }
        }
      ]
    });

    service = TestBed.inject(InspectRoutineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getInspectRoutines should query routines ordered by creation date', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.getInspectRoutines();

    expect(mockFrom).toHaveBeenCalledWith('inspect_routines');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toBe(mockResponse);
  });
});

import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService } from '../supabase';
import { WorkRoutineService } from './work-routine-service';

describe('WorkRoutineService', () => {
  let service: WorkRoutineService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        WorkRoutineService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ from: mockFrom }) as Partial<SupabaseClient> as SupabaseClient
          }
        }
      ]
    });

    service = TestBed.inject(WorkRoutineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getWorkRoutines should query routines ordered by creation date', async () => {
    const mockResponse = { data: [], error: null };
    const order = vi.fn().mockResolvedValue(mockResponse);
    const select = vi.fn().mockReturnValue({ order });
    mockFrom.mockReturnValue({ select });

    const result = await service.getWorkRoutines();

    expect(mockFrom).toHaveBeenCalledWith('work_routines');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(result).toBe(mockResponse);
  });
});

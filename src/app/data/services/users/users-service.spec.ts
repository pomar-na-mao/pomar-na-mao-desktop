import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UsersService } from './users-service';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';

describe('UsersService', () => {
  let service: UsersService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      from: mockFrom,
    } as Partial<SupabaseClient>;

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: (): Partial<SupabaseClient> => mockSupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUserData should query users by id and return single row', async () => {
    const userId = 'user-123';
    const mockResponse = { data: { id: userId, email: 'test@example.com' }, error: null };

    const single = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.getUserData(userId);

    expect(mockFrom).toHaveBeenCalledWith('users');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('id', userId);
    expect(single).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });
});

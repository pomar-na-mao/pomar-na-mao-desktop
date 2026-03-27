import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UserRolesService } from './user-roles-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';

describe('UserRolesService', () => {
  let service: UserRolesService;
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      from: mockFrom,
    } as Partial<SupabaseClient>;

    TestBed.configureTestingModule({
      providers: [
        UserRolesService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: (): Partial<SupabaseClient> => mockSupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(UserRolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getUserRoleData should query user_roles by user_id and return single row', async () => {
    const userId = 'user-123';
    const mockResponse = { data: { role: 'admin' }, error: null };

    const single = vi.fn().mockResolvedValue(mockResponse);
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    mockFrom.mockReturnValue({ select });

    const result = await service.getUserRoleData(userId);

    expect(mockFrom).toHaveBeenCalledWith('user_roles');
    expect(select).toHaveBeenCalledWith('role');
    expect(eq).toHaveBeenCalledWith('user_id', userId);
    expect(single).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });
});


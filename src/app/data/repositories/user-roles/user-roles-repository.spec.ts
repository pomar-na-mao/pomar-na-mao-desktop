 
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UserRolesRepository } from './user-roles-repository';
import { UserRolesService } from '../../services/user-roles/user-roles-service';

describe('UserRolesRepository', () => {
  let repo: UserRolesRepository;

  const getUserRoleData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        UserRolesRepository,
        {
          provide: UserRolesService,
          useValue: {
            getUserRoleData,
          },
        },
      ],
    });

    repo = TestBed.inject(UserRolesRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('isUserAdmin should be false when no role loaded', () => {
    expect(repo.isUserAdmin()).toBe(false);
  });

  it('getUserRoleData should set currentUserRole from service response', async () => {
    const userId = 'u1';
    const role = { user_id: userId, role: 'admin' };
    getUserRoleData.mockResolvedValue({ data: role, error: null });

    await repo.getUserRoleData(userId);

    expect(getUserRoleData).toHaveBeenCalledWith(userId);
    expect(repo.currentUserRole()).toBe(role);
    expect(repo.isUserAdmin()).toBe(true);
  });

  it('treats user as non-admin and clears resolved role state', () => {
    repo.currentUserRole.set({ user_id: 'u1', role: 'user' });
    expect(repo.isUserAdmin()).toBe(false);

    repo.clear();
    expect(repo.currentUserRole()).toBeNull();
  });
});


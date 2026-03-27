import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { UsersRepository } from './users-repository';
import { UsersService } from '../../services/users/users-service';

describe('UsersRepository', () => {
  let repo: UsersRepository;

  const getUserData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        UsersRepository,
        {
          provide: UsersService,
          useValue: {
            getUserData,
          },
        },
      ],
    });

    repo = TestBed.inject(UsersRepository);
  });

  it('should be created', () => {
    expect(repo).toBeTruthy();
  });

  it('getUserData should set currentUser from service response', async () => {
    const userId = 'u1';
    const user = { id: userId, email: 'test@example.com' } ;
    getUserData.mockResolvedValue({ data: user, error: null } );

    await repo.getUserData(userId);

    expect(getUserData).toHaveBeenCalledWith(userId);
    expect(repo.currentUser()).toBe(user);
  });
});


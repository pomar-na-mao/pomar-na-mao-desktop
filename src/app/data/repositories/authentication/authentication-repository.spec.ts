/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthenticationRepository } from './authentication-repository';
import { AuthenticationService } from '../../services/authentication/authentication-service';
import type { Session, AuthChangeEvent, User } from '@supabase/supabase-js';

describe('AuthenticationRepository', () => {
  let repo: AuthenticationRepository;

  const loginUserHandler = vi.fn();
  const forgotPasswordHandler = vi.fn();
  const resetPasswordHandler = vi.fn();
  const getSession = vi.fn();
  const getUser = vi.fn();
  const signOut = vi.fn();
  const authChanges = vi.fn();

  let authCallback: (event: AuthChangeEvent, session: Session | null) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    authChanges.mockImplementation((cb) => {
      authCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    TestBed.configureTestingModule({
      providers: [
        AuthenticationRepository,
        {
          provide: AuthenticationService,
          useValue: {
            loginUserHandler,
            forgotPasswordHandler,
            resetPasswordHandler,
            getSession,
            getUser,
            signOut,
            authChanges,
          },
        },
      ],
    });

    repo = TestBed.inject(AuthenticationRepository);
  });

  it('should be created and initialized with authChanges', () => {
    expect(repo).toBeTruthy();
    expect(authChanges).toHaveBeenCalled();
    expect(authCallback).toBeDefined();
  });

  it('isUserLogged should reflect currentSession', () => {
    expect(repo.isUserLogged()).toBe(false);
    repo.currentSession.set({ access_token: 'a' } as Session);
    expect(repo.isUserLogged()).toBe(true);
  });

  it('authCallback should update state', () => {
    const mockSession = { access_token: 'abc', user: { id: '123' } } as Session;

    authCallback('SIGNED_IN', mockSession);

    expect(repo.currentSession()).toBe(mockSession);
    expect(repo.user()).toBe(mockSession.user);
    expect(repo.isInitialized()).toBe(true);
  });

  it('loginUserHandler should delegate to AuthenticationService', async () => {
    const mockResponse = { data: { user: null, session: null }, error: null };
    loginUserHandler.mockResolvedValue(mockResponse);

    const result = await repo.loginUserHandler('a@b.com', 'pw');

    expect(loginUserHandler).toHaveBeenCalledWith('a@b.com', 'pw');
    expect(result).toBe(mockResponse);
  });

  it('forgotPasswordHandler should delegate to AuthenticationService', async () => {
    const mockResponse = { data: {}, error: null };
    forgotPasswordHandler.mockResolvedValue(mockResponse);

    const result = await repo.forgotPasswordHandler('a@b.com');

    expect(forgotPasswordHandler).toHaveBeenCalledWith('a@b.com');
    expect(result).toBe(mockResponse);
  });

  it('resetPasswordHandler should delegate to AuthenticationService', async () => {
    const mockResponse = { data: { user: null }, error: null };
    resetPasswordHandler.mockResolvedValue(mockResponse);

    const result = await repo.resetPasswordHandler('newpw');

    expect(resetPasswordHandler).toHaveBeenCalledWith('newpw');
    expect(result).toBe(mockResponse);
  });

  it('getSession should set currentSession and user when session exists', async () => {
    const session = { access_token: 'live', user: { id: 'u1' } } as Session;
    getSession.mockResolvedValue({ data: { session }, error: null });

    await repo.getSession();

    expect(getSession).toHaveBeenCalled();
    expect(repo.currentSession()).toBe(session);
    expect(repo.user()).toBe(session.user);
    expect(repo.isInitialized()).toBe(true);
  });

  it('getUser should set user when no error', async () => {
    const user = { id: '1' };
    getUser.mockResolvedValue({ data: { user }, error: null });

    await repo.getUser();

    expect(getUser).toHaveBeenCalled();
    expect(repo.user()).toBe(user);
  });

  it('signOut should clear session and user', async () => {
    signOut.mockResolvedValue({ error: null });
    repo.currentSession.set({ access_token: 'x' } as Session);
    repo.user.set({ id: 'u' } as User);

    const result = await repo.signOut();

    expect(signOut).toHaveBeenCalled();
    expect(repo.currentSession()).toBeNull();
    expect(repo.user()).toBeNull();
    expect(result).toEqual({ error: null });
  });
});


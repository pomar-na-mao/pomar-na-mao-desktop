/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication-service';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase';

describe('AuthenticationService (vitest)', () => {
  let service: AuthenticationService;

  const signInWithPassword = vi.fn();
  const resetPasswordForEmail = vi.fn();
  const updateUser = vi.fn();
  const getSession = vi.fn();
  const getUser = vi.fn();
  const signOut = vi.fn();
  const onAuthStateChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {
      auth: {
        signInWithPassword,
        resetPasswordForEmail,
        updateUser,
        getSession,
        getUser,
        signOut,
        onAuthStateChange,
      },
    } as unknown as SupabaseClient;


    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: (): SupabaseClient => mockSupabaseClient,
          },
        },
      ],
    });

    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loginUserHandler should call signInWithPassword with email/password', async () => {
    const email = 'test@example.com';
    const password = 'secret';
    const mockResponse = { data: { user: null, session: null }, error: null };
    signInWithPassword.mockResolvedValue(mockResponse);

    const result = await service.loginUserHandler(email, password);

    expect(signInWithPassword).toHaveBeenCalledWith({ email, password });
    expect(result).toBe(mockResponse);
  });

  it('forgotPasswordHandler should call resetPasswordForEmail', async () => {
    const email = 'test@example.com';
    const mockResponse = { data: {}, error: null };
    resetPasswordForEmail.mockResolvedValue(mockResponse);

    const result = await service.forgotPasswordHandler(email);

    expect(resetPasswordForEmail).toHaveBeenCalledWith(email);
    expect(result).toBe(mockResponse);
  });

  it('resetPasswordHandler should call updateUser with password', async () => {
    const password = 'new-secret';
    const mockResponse = { data: { user: null }, error: null };
    updateUser.mockResolvedValue(mockResponse);

    const result = await service.resetPasswordHandler(password);

    expect(updateUser).toHaveBeenCalledWith({ password });
    expect(result).toBe(mockResponse);
  });

  it('getSession should call auth.getSession', async () => {
    const mockResponse = { data: { session: null }, error: null };
    getSession.mockResolvedValue(mockResponse);

    const result = await service.getSession();

    expect(getSession).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });

  it('getUser should call auth.getUser', async () => {
    const mockResponse = { data: { user: null }, error: null };
    getUser.mockResolvedValue(mockResponse);

    const result = await service.getUser();

    expect(getUser).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });

  it('signOut should call auth.signOut', async () => {
    const mockResponse = { error: null };
    signOut.mockResolvedValue(mockResponse);

    const result = await service.signOut();

    expect(signOut).toHaveBeenCalled();
    expect(result).toBe(mockResponse);
  });

  it('authChanges should call onAuthStateChange with callback', () => {
    const mockResponse = { data: { subscription: {} } };
    onAuthStateChange.mockReturnValue(mockResponse);

    const cb = vi.fn();
    const result = service.authChanges(cb);

    expect(onAuthStateChange).toHaveBeenCalledWith(cb);
    expect(result).toBe(mockResponse);
  });

});


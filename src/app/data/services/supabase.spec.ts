import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseService, injectSupabase } from './supabase';

describe('SupabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Reflect.set(SupabaseService, 'instance', undefined);
  });

  it('should create a singleton instance', () => {
    const first = new SupabaseService();
    const second = new SupabaseService();

    expect(first).toBe(second);
    expect(first.getClient()).toBe(first.supabase);
  });

  it('should delegate signOut to the client auth API', async () => {
    const service = new SupabaseService();
    const signOutResponse: Awaited<ReturnType<typeof service.supabase.auth.signOut>> = { error: null };
    const signOutSpy = vi.spyOn(service.supabase.auth, 'signOut').mockResolvedValue(signOutResponse);

    await service.signOut();

    expect(signOutSpy).toHaveBeenCalled();
  });

  it('injectSupabase should return the current client from DI', () => {
    TestBed.configureTestingModule({
      providers: [SupabaseService]
    });

    const service = TestBed.inject(SupabaseService);
    const client = TestBed.runInInjectionContext(() => injectSupabase());

    expect(client).toBe(service.getClient());
  });
});

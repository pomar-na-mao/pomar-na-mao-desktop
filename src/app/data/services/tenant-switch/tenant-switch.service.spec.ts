import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACTIVE_CLIENT_STORAGE_KEY,
  getTenantAuthStorageKey,
} from '../../../../environments/client-config';
import { UserRolesRepository } from '../../repositories/user-roles/user-roles-repository';
import { SupabaseRequestCacheService } from '../supabase-request-cache/supabase-request-cache.service';
import { TenantSupabaseClientFactory } from '../supabase';
import {
  TENANT_BROWSER,
  TenantBrowser,
  TenantSwitchService,
} from './tenant-switch.service';

describe('TenantSwitchService', () => {
  let service: TenantSwitchService;
  let browser: TenantBrowser;
  let reload: () => void;
  let clearCache: ReturnType<typeof vi.fn>;
  let clearRole: ReturnType<typeof vi.fn>;
  let signInWithPassword: ReturnType<typeof vi.fn>;
  let signOut: ReturnType<typeof vi.fn>;
  let maybeSingle: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    reload = vi.fn();
    clearCache = vi.fn();
    clearRole = vi.fn();
    signInWithPassword = vi.fn();
    signOut = vi.fn().mockResolvedValue({ error: null });
    maybeSingle = vi.fn();
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle,
    };
    const client = {
      auth: { signInWithPassword, signOut },
      from: vi.fn().mockReturnValue(query),
    } as unknown as SupabaseClient;
    create = vi.fn().mockReturnValue(client);
    browser = { localStorage, reload };

    TestBed.configureTestingModule({
      providers: [
        TenantSwitchService,
        { provide: TENANT_BROWSER, useValue: browser },
        { provide: TenantSupabaseClientFactory, useValue: { create } },
        { provide: SupabaseRequestCacheService, useValue: { clear: clearCache } },
        { provide: UserRolesRepository, useValue: { clear: clearRole } },
      ],
    });
    service = TestBed.inject(TenantSwitchService);
  });

  it('does nothing when the target is already active', async () => {
    const result = await service.switchTenant(service.activeClientId(), 'a@b.com', 'secret');

    expect(result).toEqual({ ok: true, status: 'unchanged' });
    expect(create).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it('keeps the current tenant when target credentials are invalid', async () => {
    localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, service.activeClientId());
    localStorage.setItem(getTenantAuthStorageKey('hassAvocado'), 'provisional');
    signInWithPassword.mockResolvedValue({ data: { user: null }, error: new Error('invalid') });

    const result = await service.switchTenant('hassAvocado', 'a@b.com', 'wrong');

    expect(result).toMatchObject({ ok: false, reason: 'authentication-failed' });
    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(localStorage.getItem(getTenantAuthStorageKey('hassAvocado'))).toBeNull();
    expect(localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY)).toBe(service.activeClientId());
    expect(clearCache).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it.each([null, { role: 'user' }, { role: 'treasury' }])(
    'rejects a target account without the admin role: %s',
    async (roleData) => {
      signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
      maybeSingle.mockResolvedValue({ data: roleData, error: null });

      const result = await service.switchTenant('hassAvocado', 'a@b.com', 'secret');

      expect(result).toMatchObject({ ok: false, reason: 'authorization-failed' });
      expect(signOut).toHaveBeenCalled();
      expect(reload).not.toHaveBeenCalled();
    },
  );

  it('commits and reloads only after target admin authorization', async () => {
    signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null });

    const result = await service.switchTenant('hassAvocado', 'admin@example.com', 'secret');

    expect(result).toEqual({ ok: true, status: 'switched' });
    expect(clearCache).toHaveBeenCalledOnce();
    expect(clearRole).toHaveBeenCalledOnce();
    expect(localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY)).toBe('hassAvocado');
    expect(service.activeClientId()).toBe('hassAvocado');
    expect(reload).toHaveBeenCalledOnce();
    expect(signOut).not.toHaveBeenCalled();
  });

  it('cleans up and reports unexpected target errors', async () => {
    signInWithPassword.mockRejectedValue(new Error('network'));

    const result = await service.switchTenant('hassAvocado', 'a@b.com', 'secret');

    expect(result).toMatchObject({ ok: false, reason: 'unexpected-error' });
    expect(service.busy()).toBe(false);
    expect(signOut).toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});

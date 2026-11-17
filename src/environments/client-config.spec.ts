import { beforeEach, describe, expect, it } from 'vitest';
import {
  ACTIVE_CLIENT_STORAGE_KEY,
  CLIENT_CONFIGS,
  CONFIGURED_CLIENT_STORAGE_KEY,
  DEFAULT_CLIENT_ID,
  TENANT_CATALOG,
  getTenantAuthStorageKey,
  persistActiveClientId,
  resolveActiveClientId,
  resolveRuntimeClientId,
} from './client-config';

describe('client-config', () => {
  beforeEach(() => localStorage.clear());

  it('exposes the documented aliases for all configured tenants', () => {
    expect(TENANT_CATALOG).toEqual([
      { id: 'ricardoLichia', alias: 'Ricardo Lichia' },
      { id: 'hassAvocado', alias: 'Hass Avocado' },
      { id: 'ricardoAbacate', alias: 'Ricardo Abacate' },
    ]);
    expect(Object.keys(CLIENT_CONFIGS)).toHaveLength(3);
  });

  it('uses a valid stored tenant', () => {
    localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, 'hassAvocado');

    expect(resolveActiveClientId('ricardoLichia')).toBe('hassAvocado');
  });

  it('uses the supplied fallback when storage is absent or invalid', () => {
    expect(resolveActiveClientId('ricardoLichia')).toBe('ricardoLichia');

    localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, 'unknown-client');
    expect(resolveActiveClientId()).toBe(DEFAULT_CLIENT_ID);
  });

  it('persists only a typed tenant id and namespaces auth storage', () => {
    persistActiveClientId('ricardoAbacate');

    expect(localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY)).toBe('ricardoAbacate');
    expect(getTenantAuthStorageKey('ricardoAbacate')).toBe(
      'pomar-na-mao.auth.ricardoAbacate',
    );
    expect(getTenantAuthStorageKey('hassAvocado')).not.toBe(
      getTenantAuthStorageKey('ricardoAbacate'),
    );
  });

  it('gives a changed startup tenant precedence and clears the persisted selection', () => {
    localStorage.setItem(CONFIGURED_CLIENT_STORAGE_KEY, 'ricardoLichia');
    localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, 'ricardoLichia');

    expect(resolveRuntimeClientId('ricardoAbacate')).toBe('ricardoAbacate');
    expect(localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(CONFIGURED_CLIENT_STORAGE_KEY)).toBe('ricardoAbacate');
  });

  it('preserves an administrative switch when the same configured build reloads', () => {
    localStorage.setItem(CONFIGURED_CLIENT_STORAGE_KEY, 'ricardoLichia');
    localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, 'hassAvocado');

    expect(resolveRuntimeClientId('ricardoLichia')).toBe('hassAvocado');
    expect(localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY)).toBe('hassAvocado');
  });

  it('keeps the persisted selection when startup does not explicitly configure a tenant', () => {
    localStorage.setItem(CONFIGURED_CLIENT_STORAGE_KEY, 'ricardoAbacate');
    localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, 'ricardoLichia');

    expect(resolveRuntimeClientId(undefined, 'ricardoAbacate')).toBe('ricardoLichia');
    expect(localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY)).toBe('ricardoLichia');
    expect(localStorage.getItem(CONFIGURED_CLIENT_STORAGE_KEY)).toBeNull();
  });
});

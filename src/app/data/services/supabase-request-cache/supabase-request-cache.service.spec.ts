import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SupabaseRequestCacheService } from './supabase-request-cache.service';

describe('SupabaseRequestCacheService', () => {
  let service: SupabaseRequestCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SupabaseRequestCacheService],
    });
    service = TestBed.inject(SupabaseRequestCacheService);
  });

  it('normalizes object keys and omitted undefined values', () => {
    const first = service.buildQueryKey('plants.list', {
      zoneId: 'zone-1',
      filters: { variety: undefined, region: 'north' },
    });
    const second = service.buildQueryKey('plants.list', {
      filters: { region: 'north' },
      zoneId: 'zone-1',
    });

    expect(first).toBe(second);
  });

  it('deduplicates equivalent requests while the first is in flight', async () => {
    let resolveRequest!: (value: string[]) => void;
    const loader = vi.fn(
      () =>
        new Promise<string[]>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const options = {
      namespace: 'reference-data',
      operation: 'zones.all',
      policy: { mode: 'dedupe-only' } as const,
    };

    const first = service.read(options, loader);
    const second = service.read(options, loader);
    await Promise.resolve();
    resolveRequest(['zone-1']);

    await expect(Promise.all([first, second])).resolves.toEqual([
      ['zone-1'],
      ['zone-1'],
    ]);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(service.getMetrics().deduplicatedRequests).toBe(1);
  });

  it('reuses TTL values until they expire', async () => {
    vi.useFakeTimers();
    const loader = vi.fn().mockResolvedValue('value');
    const onCacheMiss = vi.fn();
    const options = {
      namespace: 'dashboard',
      operation: 'dashboard.snapshot',
      policy: { mode: 'ttl', ttlMs: 1_000 } as const,
      onCacheMiss,
    };

    await service.read(options, loader);
    await service.read(options, loader);
    vi.advanceTimersByTime(1_001);
    await service.read(options, loader);

    expect(loader).toHaveBeenCalledTimes(2);
    expect(onCacheMiss).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('invalidates only entries in the requested namespace', async () => {
    const zonesLoader = vi.fn().mockResolvedValue(['zone-1']);
    const plantsLoader = vi.fn().mockResolvedValue(['plant-1']);
    const policy = { mode: 'until-invalidated' } as const;

    await service.read(
      { namespace: 'reference-data', operation: 'zones.all', policy },
      zonesLoader,
    );
    await service.read(
      { namespace: 'plants', operation: 'plants.all', policy },
      plantsLoader,
    );

    service.invalidate('plants');

    await service.read(
      { namespace: 'reference-data', operation: 'zones.all', policy },
      zonesLoader,
    );
    await service.read(
      { namespace: 'plants', operation: 'plants.all', policy },
      plantsLoader,
    );

    expect(zonesLoader).toHaveBeenCalledTimes(1);
    expect(plantsLoader).toHaveBeenCalledTimes(2);
  });

  it('does not cache a request invalidated while it is in flight', async () => {
    let resolveRequest!: (value: string[]) => void;
    const loader = vi.fn(
      () =>
        new Promise<string[]>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const options = {
      namespace: 'plants',
      operation: 'plants.all',
      policy: { mode: 'until-invalidated' } as const,
    };

    const first = service.read(options, loader);
    await Promise.resolve();
    service.invalidate('plants');
    resolveRequest(['stale']);
    await first;

    loader.mockResolvedValueOnce(['fresh']);
    await expect(service.read(options, loader)).resolves.toEqual(['fresh']);
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('clears cached and in-flight reads when the session changes', async () => {
    let resolveFirst!: (value: string) => void;
    const firstLoader = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFirst = resolve;
        }),
    );
    const secondLoader = vi.fn().mockResolvedValue('new-session');
    const options = {
      namespace: 'plants',
      operation: 'plants.all',
      policy: { mode: 'until-invalidated' } as const,
    };

    const first = service.read(options, firstLoader);
    await Promise.resolve();
    service.clear();
    const second = service.read(options, secondLoader);
    resolveFirst('old-session');

    await expect(first).resolves.toBe('old-session');
    await expect(second).resolves.toBe('new-session');
    await service.read(options, secondLoader);
    expect(secondLoader).toHaveBeenCalledTimes(1);
  });
});

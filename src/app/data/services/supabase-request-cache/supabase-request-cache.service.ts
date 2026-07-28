import { Injectable } from '@angular/core';

export const SUPABASE_CACHE_NAMESPACES = {
  dashboard: 'dashboard',
  operations: 'operations',
  occurrences: 'occurrences',
  plantCounters: 'plant-counters',
  plants: 'plants',
  referenceData: 'reference-data',
} as const;

export type SupabaseCachePolicy =
  | { mode: 'dedupe-only' }
  | { mode: 'ttl'; ttlMs: number }
  | { mode: 'until-invalidated' };

export type SupabaseReadOptions<T> = {
  namespace: string | string[];
  operation: string;
  params?: unknown;
  policy: SupabaseCachePolicy;
  forceRefresh?: boolean;
  cacheWhen?: (value: T) => boolean;
  onCacheMiss?: () => void;
};

export type SupabaseRequestMetrics = {
  cacheHits: number;
  deduplicatedRequests: number;
  underlyingRequests: number;
};

type CacheEntry = {
  expiresAt: number | null;
  namespaces: Set<string>;
  value: unknown;
};

@Injectable({
  providedIn: 'root',
})
export class SupabaseRequestCacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private readonly namespaceVersions = new Map<string, number>();
  private cacheGeneration = 0;
  private metrics: SupabaseRequestMetrics = {
    cacheHits: 0,
    deduplicatedRequests: 0,
    underlyingRequests: 0,
  };

  public buildQueryKey(operation: string, params?: unknown): string {
    return `${operation}:${stableSerialize(params ?? null)}`;
  }

  public read<T>(
    options: SupabaseReadOptions<T>,
    loader: () => PromiseLike<T>,
  ): Promise<T> {
    const key = this.buildQueryKey(options.operation, options.params);
    const namespaces = this.normalizeNamespaces(options.namespace);

    if (!options.forceRefresh) {
      const cached = this.getCachedValue<T>(key);
      if (cached.found) {
        this.metrics.cacheHits++;
        return Promise.resolve(cached.value);
      }

      const pending = this.inFlight.get(key) as Promise<T> | undefined;
      if (pending) {
        options.onCacheMiss?.();
        this.metrics.deduplicatedRequests++;
        return pending;
      }
    }

    options.onCacheMiss?.();

    const namespaceVersions = new Map(
      namespaces.map((namespace) => [
        namespace,
        this.namespaceVersions.get(namespace) ?? 0,
      ]),
    );
    const cacheGeneration = this.cacheGeneration;

    this.metrics.underlyingRequests++;

    const request = Promise.resolve()
      .then(loader)
      .then((value) => {
        if (
          this.shouldCache(options, value) &&
          cacheGeneration === this.cacheGeneration &&
          this.namespacesAreCurrent(namespaceVersions)
        ) {
          this.cache.set(key, {
            expiresAt: this.getExpiration(options.policy),
            namespaces: new Set(namespaces),
            value,
          });
        }

        return value;
      })
      .finally(() => {
        if (this.inFlight.get(key) === request) {
          this.inFlight.delete(key);
        }
      });

    this.inFlight.set(key, request);
    return request;
  }

  public invalidate(namespace: string | string[]): void {
    const namespaces = new Set(this.normalizeNamespaces(namespace));

    namespaces.forEach((item) => {
      this.namespaceVersions.set(
        item,
        (this.namespaceVersions.get(item) ?? 0) + 1,
      );
    });

    for (const [key, entry] of this.cache) {
      if ([...entry.namespaces].some((item) => namespaces.has(item))) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cacheGeneration++;
    this.cache.clear();
    this.inFlight.clear();
  }

  public getMetrics(): Readonly<SupabaseRequestMetrics> {
    return { ...this.metrics };
  }

  public resetMetrics(): void {
    this.metrics = {
      cacheHits: 0,
      deduplicatedRequests: 0,
      underlyingRequests: 0,
    };
  }

  private getCachedValue<T>(
    key: string,
  ): { found: true; value: T } | { found: false } {
    const entry = this.cache.get(key);
    if (!entry) {
      return { found: false };
    }

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return { found: false };
    }

    return { found: true, value: entry.value as T };
  }

  private getExpiration(policy: SupabaseCachePolicy): number | null {
    if (policy.mode === 'until-invalidated') {
      return null;
    }

    if (policy.mode === 'ttl') {
      return Date.now() + policy.ttlMs;
    }

    return Date.now();
  }

  private shouldCache<T>(options: SupabaseReadOptions<T>, value: T): boolean {
    if (options.policy.mode === 'dedupe-only') {
      return false;
    }

    return options.cacheWhen?.(value) ?? true;
  }

  private normalizeNamespaces(namespace: string | string[]): string[] {
    return [
      ...new Set(Array.isArray(namespace) ? namespace : [namespace]),
    ].sort();
  }

  private namespacesAreCurrent(
    namespaceVersions: Map<string, number>,
  ): boolean {
    return [...namespaceVersions].every(
      ([namespace, version]) =>
        (this.namespaceVersions.get(namespace) ?? 0) === version,
    );
  }
}

function stableSerialize(value: unknown): string {
  return JSON.stringify(normalizeValue(value));
}

function normalizeValue(value: unknown): unknown {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : String(value);
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item) ?? null);
  }

  if (typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        const item = normalizeValue((value as Record<string, unknown>)[key]);
        if (item !== undefined) {
          normalized[key] = item;
        }
        return normalized;
      }, {});
  }

  return undefined;
}

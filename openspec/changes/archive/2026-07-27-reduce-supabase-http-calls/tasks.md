## 1. Baseline and Classification

- [x] 1.1 Map every Supabase table, RPC and Function call under `src/app/data/services/**` and group them by screen/flow.
- [x] 1.2 Classify each call as mutation, volatile read, filtered read, reference data, or screen snapshot.
- [x] 1.3 Record the current expected call count for dashboard, operations, mass inclusion, plants and shared reference-data flows.
- [x] 1.4 Identify which reductions can be client-only and which require Supabase RPC/Function changes.

## 2. Shared Request Efficiency Layer

- [x] 2.1 Create a shared Angular service/helper for stable query-key generation from operation names and normalized parameters.
- [x] 2.2 Implement in-flight deduplication so concurrent equivalent reads reuse one underlying Promise.
- [x] 2.3 Implement cache policies for dedupe-only, TTL-based reads and cache-until-invalidation reads.
- [x] 2.4 Implement namespace-based invalidation for plants, dashboard, operations, occurrences and reference data.
- [x] 2.5 Add unit tests for query-key normalization, in-flight deduplication, TTL behavior and namespace invalidation.

## 3. Client Flow Migration

- [x] 3.1 Migrate zones, regions, varieties and occurrence-type option reads to the shared cache where the data is low-volatility.
- [x] 3.2 Migrate dashboard support data and snapshot loading to deduplicate equivalent requests and avoid repeated effect-triggered fetches.
- [x] 3.3 Migrate mass inclusion option loading to reuse cached reference data and avoid duplicate option calls across screen entries.
- [x] 3.4 Migrate operations loading to skip equivalent filter refetches and preserve latest-response-wins behavior.
- [x] 3.5 Migrate plant list/count reads that remain in use to the appropriate dedupe or cache policy.
- [x] 3.6 Add or update unit tests for each migrated repository/view-model path, asserting returned data and underlying Supabase call counts.

## 4. Supabase Consolidation

- [x] 4.1 Decide, from the baseline, whether dashboard, operations, mass inclusion or plant counters need new/changed RPCs or Functions beyond client caching.
- [x] 4.2 No Supabase change is required for this implementation; optional backend reductions are documented as proposals only.
- [x] 4.3 No RPC/Function client adapter change is required because existing contracts were preserved.
- [x] 4.4 No database contract changed, so `database.md` does not require an update.
- [x] 4.5 No consolidated backend adapter or SQL contract was introduced; client call-count coverage applies instead.

## 5. Verification and Cleanup

- [x] 5.1 Run the unit test suite and fix failures.
- [x] 5.2 Run the Angular build and fix failures.
- [x] 5.3 Compare optimized flow call counts against the baseline and document the reductions achieved.
- [x] 5.4 Review cache invalidation coverage after plant insert/delete and `syncPolygonBulkUpdate`.
- [x] 5.5 No obsolete loading path remains after the shared cache integration.

## ADDED Requirements

### Requirement: Deduplicated Supabase Reads
The system SHALL deduplicate concurrent Supabase read requests that have the same stable query key.

#### Scenario: Concurrent equivalent reads share one request
- **WHEN** two or more consumers request the same Supabase read with equivalent normalized parameters before the first request completes
- **THEN** the system MUST execute only one underlying Supabase HTTP request and resolve all consumers with the same result

#### Scenario: Different parameters are not deduplicated
- **WHEN** two Supabase read requests use different normalized query keys
- **THEN** the system MUST execute separate underlying Supabase HTTP requests

### Requirement: Cacheable Reference Data
The system SHALL cache low-volatility reference data returned from Supabase until an explicit invalidation or refresh occurs.

#### Scenario: Reference data is reused after first load
- **WHEN** a screen requests already-loaded reference data such as zones, regions, varieties, or occurrence types
- **THEN** the system MUST return the cached data without issuing another Supabase HTTP request

#### Scenario: Refresh bypasses stale reference data
- **WHEN** a caller explicitly refreshes a cacheable reference query
- **THEN** the system MUST issue a new Supabase request and replace the cached value with the refreshed result

### Requirement: Mutation-driven Cache Invalidation
The system SHALL invalidate cached Supabase reads affected by successful mutations or synchronization RPCs.

#### Scenario: Plant mutation invalidates dependent reads
- **WHEN** a plant is inserted, updated, deleted, or changed by a bulk synchronization RPC
- **THEN** the system MUST invalidate cached plant lists, dashboard snapshots, plant counters, and related operation or occurrence reads that can be affected by that change

#### Scenario: Failed mutation keeps existing cache
- **WHEN** a Supabase mutation or synchronization RPC fails
- **THEN** the system MUST NOT invalidate existing cached reads solely because that failed mutation was attempted

### Requirement: Consolidated Screen Loading
The system SHALL consolidate Supabase reads that are required together to render a single screen state when consolidation reduces round-trips without changing functional results.

#### Scenario: Screen support data loads through a consolidated path
- **WHEN** a screen needs multiple Supabase reference datasets before it can render its controls
- **THEN** the system MUST load those datasets through a consolidated request or a shared cached request path instead of issuing repeated independent requests for each screen instance

#### Scenario: Consolidated responses preserve existing data contracts
- **WHEN** a repository consumes data returned by a consolidated RPC, Function, or service method
- **THEN** the repository MUST expose the same domain-level data expected by existing view-models and components

### Requirement: Reactive Request Stabilization
The system SHALL avoid redundant Supabase requests caused by equivalent reactive state changes.

#### Scenario: Equivalent filters do not refetch
- **WHEN** a view-model recomputes filters to values equivalent to the previous normalized query key
- **THEN** the system MUST NOT issue another Supabase HTTP request for that unchanged query

#### Scenario: Latest request wins
- **WHEN** multiple non-equivalent Supabase reads are triggered in quick succession for the same screen state
- **THEN** the system MUST apply only the latest matching response to the visible state

### Requirement: Supabase Call Count Verification
The system SHALL provide automated verification that optimized flows reduce or avoid redundant Supabase HTTP calls.

#### Scenario: Unit tests count underlying Supabase invocations
- **WHEN** unit tests exercise cacheable or deduplicated data flows
- **THEN** the tests MUST assert the number of underlying Supabase table, RPC, or Function invocations expected for that flow

#### Scenario: Consolidation has a before-and-after target
- **WHEN** a screen flow is migrated to a consolidated or cached request path
- **THEN** the implementation MUST document the expected call-count reduction for that flow in tests, task notes, or related implementation documentation

### Requirement: Database Contract Documentation
The system SHALL document every Supabase database or function contract change introduced for request consolidation.

#### Scenario: RPC or Function is created or changed
- **WHEN** the implementation creates or changes a Supabase RPC, Edge Function, table, policy, permission, trigger, or related database contract
- **THEN** the implementation MUST update `database.md` with the contract, inputs, outputs, security considerations, and migration details

#### Scenario: Client-only optimization does not require database contract changes
- **WHEN** a request reduction is achieved only through client-side cache, deduplication, or invalidation logic
- **THEN** the implementation MUST NOT require a Supabase migration solely for that optimization

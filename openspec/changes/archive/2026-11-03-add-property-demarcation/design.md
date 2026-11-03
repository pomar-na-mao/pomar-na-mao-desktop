## Context

See `proposal.md` for motivation. The desktop app already reads ordered `public.farm` rows through `FarmBoundaryService`, uses Leaflet for its maps, and provides a reusable polygon-drawing interaction in `/dados-basicos`. The `farm` table stores one row per vertex (`id`, `latitude`, `longitude`, `order`) and is consumed by dashboard and operation maps, so replacement must not expose an empty or partially written perimeter.

The change crosses routing/navigation, map UI, frontend data orchestration, Supabase RPC/migration, cache behavior, automated tests, and the consolidated database architecture document.

## Goals / Non-Goals

**Goals:**

- Keep the UI centered on one map and one property polygon while reusing established map behavior and visual conventions.
- Treat drawing order as the canonical persisted vertex order and close the polygon visually without duplicating the first point in `farm`.
- Make replacement of the complete perimeter atomic, validated, concurrency-safe, and restricted to authenticated users.
- Keep the executable migration and the canonical SQL/documentation in `database.md` consistent.

**Non-Goals:**

- Supporting multiple farms, holes, multipolygons, or multiple simultaneous property boundaries.
- Editing individual persisted vertices in place or retaining boundary revision history.
- Changing the schema of `public.farm` or changing existing consumers of its ordered rows beyond cache refresh compatibility.

## Decisions

### 1. Add a dedicated property-demarcation feature and adapt shared map behavior

Create a lazy-loaded screen under the existing Cadastro route container, with a feature-specific view/view-model and data service boundary. Extract or extend only the reusable drawing primitives from the `/dados-basicos` map selector: single polygon, ordered point collection, finish/undo/clear actions, external polygon rendering, and fit-to-bounds.

The property screen owns latitude/longitude form validation, focus action, load/save state, success/error messaging, and save eligibility. This avoids coupling property persistence to the bulk plant-update workflow. Alternative considered: embed the existing basic-data screen/component unchanged; rejected because it exposes plant-specific state and controls that do not belong to property demarcation.

HTML usage of newly introduced standalone components will use self-closing tags as required by the project convention.

### 2. Represent closure implicitly

The client keeps exactly the distinct vertices selected by the user, in marking order. Leaflet and GeoJSON rendering connect the final vertex back to the first, but the first point is not inserted again as row `n + 1`. A polygon becomes saveable only after finalization with at least three distinct, finite, in-range coordinate pairs.

This keeps `farm.order` contiguous and prevents a duplicated vertex from affecting downstream bounds or geometry creation. Alternative considered: persist the repeated closing coordinate; rejected because the relational model describes vertices and existing consumers already close polygon rings when rendering.

### 3. Replace the boundary through one JSONB RPC

Add `public.replace_farm_boundary(p_points jsonb) returns integer`. The payload is an ordered JSON array whose elements contain numeric `latitude` and `longitude`; callers do not provide `id` or `order`.

The function will:

1. Require an authenticated caller and an array with at least three points.
2. Validate finite numeric coordinates, latitude range `[-90, 90]`, longitude range `[-180, 180]`, and at least three distinct coordinate pairs.
3. Acquire an appropriate transaction/table lock to serialize concurrent replacements.
4. Delete all existing `public.farm` rows.
5. Insert each payload element with `gen_random_uuid()` and `order = ordinality`, producing contiguous values `1..n`.
6. Return the inserted vertex count.

The function runs as a single PostgreSQL statement transaction, so any exception rolls back both deletion and insertion. It will use a fixed `search_path`, revoke default/public execution, and grant execution only to `authenticated`. Existing table RLS and authenticated DML policies remain in force; the implementation should prefer security-invoker semantics unless deployment verification demonstrates a narrowly scoped security-definer function is required.

Alternative considered: issue separate frontend `delete` and `insert` calls; rejected because a network or insert failure could leave `farm` empty or incomplete.

### 4. Refresh all consumers through cache invalidation

Extend the farm boundary data layer with the RPC-backed replacement operation. On success, invalidate the reference-data/farm boundary cache before reloading and fitting the persisted result. On failure, preserve the local candidate polygon so the user can retry and do not invalidate the last known persisted value.

### 5. Keep migration and architecture documentation synchronized

Create an executable Supabase migration under `supabase/migrations/` for the RPC, execution privileges, and rollback guidance. Apply the migration to the configured Supabase project through the Supabase MCP during implementation and verify the deployed signature/permissions.

Update `database.md` in all relevant canonical locations:

- Section 18: add the RPC to the catalog with client, contract, validation, transaction, response, and authorization behavior.
- Section 20: add the `/cadastro/propriedade` end-to-end process, including load, drawing order, manual coordinate focus, save, overwrite, cache refresh, and errors.
- Section 25: add the idempotent function/grants to the consolidated creation query and a migration subsection with application and rollback SQL.

Although the request highlights sections 20 and 25, section 18 must also change to keep the RPC catalog complete.

### 6. Test at observable boundaries

Add unit tests for route/menu exposure, ordered vertex normalization, closure and minimum-point rules, coordinate validation/focus without polygon mutation, initial polygon rendering and fit, RPC payload/order mapping, success cache invalidation/reload, and failure state preservation. Mock Supabase and Leaflet boundaries rather than relying on a live map or database in unit tests.

## Risks / Trade-offs

- **[Shared map changes regress `/dados-basicos`]** → Prefer a small reusable primitive or additive inputs/outputs and retain/add regression tests for the existing selector.
- **[Malformed JSON reaches the mutation]** → Validate every element and coordinate range before deleting any row; raise a descriptive database exception.
- **[Two users save concurrently]** → Serialize replacement transactions with a table or advisory transaction lock; the last successfully committed replacement becomes authoritative.
- **[Stale perimeter remains visible elsewhere]** → Invalidate the shared farm/reference-data cache after success and reload from `farm` before reporting completion.
- **[Migration and `database.md` drift]** → Derive both from the same reviewed SQL contract and verify signatures/grants after applying through the Supabase MCP.
- **[Very large payload impacts RPC time]** → The expected boundary is small; validate a defensible upper vertex limit during implementation if production data indicates abuse risk.

## Migration Plan

1. Add the idempotent migration and matching `database.md` SQL/documentation changes.
2. Apply the migration through the Supabase MCP and verify function signature, execution privileges, RLS interaction, successful replacement, and rollback-on-error in the target project.
3. Deploy the frontend route, menu entry, map screen, service integration, and tests after the RPC is available.
4. Smoke-test with no boundary, an existing boundary, a valid replacement, invalid coordinates, and a forced RPC error.

Rollback the frontend route/menu first if needed. Database rollback revokes execute and drops `public.replace_farm_boundary(jsonb)`; it does not delete or restore `farm` data. If a previously saved boundary must be restored, re-submit its ordered vertices before dropping the function.

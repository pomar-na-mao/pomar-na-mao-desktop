## Context

See `proposal.md` for the motivation. The desktop already has a layered Operations module (view, view model, repository, service and domain models) with Leaflet rendering, a farm-boundary overlay, responsive filter/map composition, full-screen behavior and a right-side details card. The mobile MIPD flow already persists one `field_operations` row per marking, links it to `mipd_markings`, and stores optional photos in the private `mipd-plant-photos` bucket.

The persisted contract contains a historical naming mismatch that must be preserved: `operation_types.code = 'mipd'`, while `field_operations.source = 'mpid'`. Existing desktop operation RPCs do not return `plant_parts` or `photo_object_path`, so they cannot supply the requested details without a new read contract. The existing root `migration.sql` belongs to the active occurrence-management change; implementation must deliberately replace its contents only when this change is applied, while preserving that other change in its own OpenSpec artifacts/history.

## Goals / Non-Goals

**Goals:**

- Keep the MIPD screen behaviorally and visually aligned with Operations while isolating its state and data contract.
- Fetch all map/detail fields in one cached RPC request per filter combination.
- Keep the photo bucket private and create short-lived signed URLs only for the selected marking.
- Preserve latest-request-wins behavior when filters change rapidly.
- Deliver an idempotent SQL migration and keep `database.md` as the canonical complete database description.

**Non-Goals:**

- Editing, resolving or deleting MIPD markings from the desktop.
- Changing the mobile synchronization RPC, table structure, bucket layout or the persisted `mpid` source value.
- Merging MIPD into the existing Operações type selector; it remains a dedicated sidebar module.
- Returning image bytes or durable signed URLs from PostgreSQL.

## Decisions

### 1. Create a dedicated MIPD vertical slice and reuse the Operations presentation pattern

Create `ui/views/mipd`, `ui/view-models/mipd`, `data/repositories/mipd`, `data/services/mipd` and a MIPD domain model. The view will mirror the Operations shell and component boundaries (filters panel, map, details card), using self-closing component tags in HTML and the same Tailwind/PrimeNG classes.

This avoids coupling MIPD-specific filtering, history and photo state into the already multi-mode `OperationsViewModel`. Extracting a generic map framework was considered, but would enlarge the change and risk visual regressions in Operations; direct reuse of established primitives and classes is safer for exact parity.

### 2. Add a flattened `get_mipd_operations` read model

The RPC will return one row per `mipd_markings` record, joining `field_operations`, `operation_types`, `plants`, optional `zones`, and `occurrence_types`. Its signature will be:

`get_mipd_operations(p_start_date date DEFAULT NULL, p_end_date date DEFAULT NULL, p_occurrence_type_id uuid DEFAULT NULL, p_zone_id uuid DEFAULT NULL)`

The query will require both `operation_types.code = 'mipd'` and `field_operations.source = 'mpid'`, restrict occurrence types to `category = 'PEST_DISEASE'`, apply inclusive date filters using `(fo.created_at AT TIME ZONE 'America/Sao_Paulo')::date`, and order by `observed_at DESC, started_at DESC, marking_id`. It will return the fields specified by `mipd-operation-read-model`.

The optional `p_zone_id` filters by `plants.zone_id`. The existing three-argument function is explicitly dropped by `migration_mipd_zone_filter.sql` before the four-argument version is created, preventing ambiguous PostgREST overloads.

A nested operation/plant JSON response matching inspection was considered. The flattened row is preferred because each operation currently represents one marking and the client can group rows by `plant_id` without nested parsing or duplicated occurrence semantics.

The function will use the project's hardened RPC pattern (`SECURITY DEFINER`, empty `search_path`, fully qualified names), revoke execution from `PUBLIC` and `anon`, and grant it only to `authenticated`. Because mobile supports anonymous uploads and the current owner-only SELECT policy would prevent desktop auditors from signing those objects, the original migration replaces that policy with a bucket-scoped SELECT policy for `authenticated`; the bucket remains private and `anon` receives no read access. The initial implementation is emitted in root `migration.sql`, while the later zone-filter evolution is delivered separately as `migration_mipd_zone_filter.sql`. The consolidated definition and deployment notes are incorporated into `database.md` sections 18, 20 and 25.

### 3. Load the occurrence catalog separately and filter it client-side

The MIPD repository/view model will consume the existing occurrence-types repository and derive dropdown options where `category === 'PEST_DISEASE'`. The RPC accepts the chosen UUID rather than returning the entire catalog.

The dropdown starts on `Todos`. In that state, a valid date range triggers the RPC without `p_occurrence_type_id`, allowing the database's existing optional parameter to return all `PEST_DISEASE` markings in the period.

This preserves the existing reference-data cache and avoids duplicating a catalog endpoint. Hard-coded pest/disease values were rejected because the table is user-managed.

### 4. Group markers by plant and retain marking history

The view model will group RPC rows by `plant_id`, sort each group newest-first and draw a single circle marker for each plant through a Leaflet layer group and canvas renderer, following inspection. Selecting a marker stores the group's rows and current index; previous/next controls update the selected marking without refetching. Filter changes clear the selection before rendering new results.

This prevents stacked markers at identical coordinates and gives access to repeated observations in the selected period. Rendering a marker per marking was rejected because overlapping points would be indistinguishable and harder to select.

The farm boundary and every valid zone polygon are loaded independently of the MIPD filters and rendered in a dedicated non-interactive Leaflet pane below the plant markers. Ordered `regions` points are preferred for each zone, with `zones.polygon` as a fallback, and map bounds include farm, zones and filtered plants so the territorial context remains visible.

When a zone filter is selected, its already-loaded polygon becomes the immediate map bound. Subsequent MIPD results extend only that selected-zone bound with the returned plants, preventing the asynchronous query response from resetting the viewport to the full farm. Selecting `Todas as zonas` restores the general territorial bounds.

### 5. Sign photos lazily and treat signing as independent detail state

The RPC returns only `photo_object_path`. When a marking with a path becomes selected, the client calls Storage `createSignedUrl` for `mipd-plant-photos` with a short lifetime (five minutes). A selection token/request id prevents a late signing response from attaching the wrong photo after history navigation or closing the card. The view model clears signed URLs on selection changes and exposes loading, unavailable and no-photo states.

Signing every result up front was rejected because most photos will never be opened, URLs expire, and bulk signing increases latency and Storage requests. Making the bucket public is incompatible with the mobile privacy contract.

### 6. Use latest-request-wins and the existing operations cache namespace

The service will call the new RPC through `SupabaseRequestCacheService` with a parameterized key and the existing `operations` namespace/short TTL. The repository will increment a request id so only the newest response can update its signals. Errors clear stale results and remain observable to the view model.

Creating a new cache namespace was considered unnecessary because MIPD reads are operational history and should be invalidated with other operation data.

### 7. Test at each architectural boundary

Unit tests will verify service argument omission/inclusion and cache keying; repository stale-response protection; view-model catalog filtering, filter resets, grouping, selection/history and signed-photo race handling; component layout/labels/details; map marker interaction; and route/sidebar ordering. The Supabase MCP may be used read-only to compare the current schema with the documented assumptions, but the remote migration will not be applied automatically because the requested handoff is an SQL Editor script for the user to execute.

## Risks / Trade-offs

- **[Persisted `mpid` spelling is counterintuitive]** → Keep the mismatch explicit in model comments, SQL predicates, specs and `database.md`; do not silently query `source = 'mipd'`.
- **[Authenticated auditors need photos uploaded by other or anonymous operators]** → Keep the bucket private but grant bucket-scoped SELECT only to `authenticated`; retain no anonymous read policy and show an independent unavailable state without hiding the marking.
- **[Exact visual copying can drift as Operations evolves]** → Reuse shared tokens/classes and add structural tests that assert the main dimensions and placement; avoid introducing a parallel design language.
- **[Multiple observations share coordinates]** → Group by plant and provide history navigation rather than overlapping markers.
- **[The root `migration.sql` is a single handoff file]** → During apply, inspect the working tree and active change, then replace it deliberately with this change's self-contained migration; do not mix unrelated occurrence-category SQL into the MIPD deployment script.
- **[Large result sets can increase client rendering cost]** → Filter by period and occurrence type at the database, draw one canvas marker per distinct plant and avoid pre-signing photos.

## Migration Plan

1. Implement and unit-test the Angular/domain/data slice without changing existing Operações behavior.
2. Write the idempotent `get_mipd_operations` definition and grants to root `migration.sql`; update `database.md` sections 18, 20 and the consolidated item 25 with identical SQL/contract.
3. Validate the SQL contract and, when a Supabase connection is available, inspect the live prerequisite tables/functions read-only through the Supabase MCP. Deliver `migration.sql` for the user to execute in the SQL Editor; do not mutate the remote database automatically.
4. Run static analysis and the affected/full test suites, then validate the OpenSpec change.

Rollback revokes execution from `authenticated` and drops only `public.get_mipd_operations(date, date, uuid, uuid)`. The Angular route/sidebar entry and MIPD slice can then be reverted independently. No table data, mobile synchronization behavior or stored photo is removed.

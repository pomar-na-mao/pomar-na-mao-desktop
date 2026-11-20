## Context

See `proposal.md` for the motivation and the change specs for observable behavior. The mobile flow already owns writes through `public.sync_harvest_forecasts(jsonb)`, and `public.harvest_forecasts` stores one current classification per unique `plant_id`. The desktop currently has no read contract or UI for that data.

The closest presentation reference is `/meu-pomar`: an Angular standalone screen with a fixed-width, scrollable filter panel, a flexible Leaflet map, signals in a route-scoped view model, and shared farm/zone repositories. Current controls combine PrimeNG date pickers, the project `app-select`, Tailwind/PrimeUI surface tokens and light/dark states. All component imports used in HTML must use self-closing tags.

`database.md` already documents the mobile harvest forecast process in 20.21 and the table/sync migration in 25.26. This change must extend those chapters without changing the one-row-per-plant contract. The user's instruction overrides the generic OpenSpec context for remote execution: no Supabase MCP mutation will be performed; database work is delivered as a versioned SQL migration.

## Goals / Non-Goals

**Goals:**

- Add a vertical slice that matches the project's domain/service/repository/view-model/view separation and reuses the existing farm boundary and zone data sources.
- Keep map rendering, filtered records, editable weights and the last calculated result as distinct states so stale values are never presented as current.
- Use one server request per filter state to obtain all marker and classification data needed for both the map and client-side calculation.
- Make classification understandable without color alone and keep every filter, editable cell and action keyboard accessible.
- Deliver an idempotent, transactional and reversible read-only RPC migration plus synchronized documentation in `database.md` items 20 and 25.

**Non-Goals:**

- Editing or deleting `harvest_forecasts` from the desktop.
- Changing the mobile synchronization payload, nearest-plant association or unique `plant_id` rule.
- Persisting scenario weights in Supabase, local storage or user preferences; edits last only for the current screen instance.
- Forecasting `N` plants, applying agronomic corrections, converting kg to other units or producing historical/versioned projections.
- Applying the migration to any remote Supabase project.

## Decisions

### 1. Create a dedicated harvest forecast vertical slice

Add a domain model and calculation utility, `data/services/harvest-forecast`, `data/repositories/harvest-forecast`, `ui/view-models/harvest-forecast`, and a standalone view under `ui/views/harvest-forecast` split into screen shell, filters/parameters panel, map and result card. Provide the view model at route component scope, as `/meu-pomar` does, so session-only weights reset naturally when leaving the screen.

This keeps forecast-specific state out of the already complex My Orchard view model while allowing the layout classes, date interaction, map controls and territorial polygon helpers to be mirrored. Extending My Orchard itself was rejected because this is a separately navigable workflow with different query and calculation semantics.

### 2. Load territory immediately but query plants only after filter interaction

Initialization loads the farm boundary and all zones, creates the Leaflet map and fits valid territorial geometry. Forecast markers remain empty. A view-model `hasFilterInteraction` signal becomes true when the user changes period, classification or zone; a debounced effect then validates the dates and requests the current filter combination. Clearing all filters resets the flag, markers, errors and calculation while leaving territorial layers intact.

Each request receives a monotonically increasing token. Only the latest token may update result, error or loading signals. This follows the existing latest-request-wins protection used by MIPD and avoids an older response repainting the map after rapid filter changes.

Always querying on initial load was rejected because the requested initial state explicitly contains no plants. Requiring every filter to be filled was also rejected because the database contract supports optional, composable filters and users may legitimately explore one dimension at a time.

### 3. Use a single read RPC joined to current plant coordinates

Create `supabase/migrations/20261120120000_add_harvest_forecast_desktop_query.sql` with:

```sql
public.get_harvest_forecasts(
  p_start_date date default null,
  p_end_date date default null,
  p_classifications text[] default null,
  p_zone_id uuid default null
)
```

The function returns `forecast_id`, `plant_id`, `zone_id`, `classification`, `collected_at`, `latitude` and `longitude`. It joins `public.harvest_forecasts` to `public.plants` by the unique plant identifier, rejects an inverted interval and classification values outside `N/P/M/G/GG`, omits plants without valid coordinates, and orders by `created_at DESC, plant_id`. Date predicates use the half-open UTC instants corresponding to local São Paulo days: start at local midnight and end before the midnight following `p_end_date`, giving an inclusive user-facing interval across offset changes.

The function is `SECURITY DEFINER`, uses `SET search_path = ''`, fully qualifies objects, rejects a missing `auth.uid()`, revokes `PUBLIC` and `anon`, and grants `authenticated` and `service_role`. The migration changes no table, data, RLS policy or mobile RPC, and ends with `NOTIFY pgrst, 'reload schema'` inside a transaction. A direct PostgREST table select was considered, but the RPC centralizes time-zone behavior, validation, security and the coordinate join in a testable contract.

The service calls this RPC through the existing request abstraction with a parameter-derived cache key and a short-lived harvest-forecast namespace. The repository exposes result/loading/error signals and owns request-token protection.

### 4. Reuse the Meu Pomar shell and controls, with forecast-specific accessible semantics

The route shell uses the same responsive widths as `/meu-pomar` (`w-full`, `md:w-96`, `lg:w-[25rem]`, `xl:w-[26rem]`) and the same flexible full-height map area. The panel scrolls vertically so the parameter table and result card remain reachable on short viewports. Date fields mirror **Período da Operação**; Zone, Scenario and Classification use `app-select`. Classification defaults to **Todas**, represented by an omitted RPC classification parameter, while the remaining options show the classification color and textual label.

The editable 4×3 weight matrix uses numeric controls in every scenario cell, not only in the selected column. Values must be finite and non-negative. Native number-input spin buttons are hidden across Chromium/WebKit and Firefox while direct typing and keyboard behavior remain available. The selected scenario column receives a border/background emphasis that does not shift layout. Interactive elements use pointer/hover feedback, 150–300 ms color transitions and visible keyboard focus. No emoji icons are introduced.

Marker colors use stable, theme-compatible values: `N #64748B`, `P #2563EB`, `M #EAB308`, `G #F97316`, and `GG #DC2626`, with a contrasting border. The legend and marker accessible label include code plus `Nenhuma`, `Pequena`, `Média`, `Grande` or `Muito grande`, so color is supplemental. The map retains farm and all zone polygons below the marker layer and follows the existing fullscreen/resize behavior.

### 5. Calculate locally from the exact plotted result

The RPC result already contains every record needed for the map, so a second aggregate request would risk calculating against a different snapshot. A pure domain function counts `P/M/G/GG`, multiplies each count by the currently selected scenario weight and returns per-class subtotal plus total. `N` is intentionally excluded and contributes zero kg. The default selected scenario is **Realista**, a neutral starting point; all three matrices retain the requested defaults.

The result is represented as `null` until **Previsão** is clicked. The card always renders its labels and uses an empty placeholder while null. Each productive-class row pairs its marker color with only the textual classification name, aligns the formula with tabular numerals, and separates the emphasized total from the subtotals. Any change to filters, query result, scenario or weight restores null; clicking calculates against the current repository result. Numbers are formatted for `pt-BR` with the `kg` unit without altering calculation precision.

Persisting edited weights was rejected because no persistence scope, ownership or cross-user behavior was requested. Server-side aggregation was rejected because weights are editable client state and the full record set is already required for markers.

### 6. Extend routing, documentation and tests as first-class contracts

Register `/previsao-de-safra` as an authenticated lazy child route and insert one top-level **Previsão de Safra** menu item immediately after the complete `Mipd` group. Update route and menu tests to pin presence, label, target and order.

Add a new desktop subsection after 20.21 in `database.md` describing the UI, filters, marker colors, scenario parameters and formula. Add item 25.27 containing the migration contract, complete SQL or canonical migration reference, grants, deployment order and rollback. The documented signature and permissions must match the versioned migration exactly.

Unit tests cover the domain calculation/defaults/validation, service RPC arguments and cache keys, repository stale responses and errors, view-model initial state/filter composition/invalidation, panel labels and edits, result-card empty/calculated states, map polygons/marker colors/legend/fullscreen behavior, screen responsiveness, and route/menu ordering. Validation includes focused Vitest suites, full tests, lint/build as practical, and `openspec validate add-harvest-forecast-desktop-view --strict`.

## Risks / Trade-offs

- **[A consolidated row is not historical data]** Filtering `created_at` reflects the collection timestamp currently stored after the latest mobile upsert, not every past classification → Label the filter **Período de coleta**, document this behavior and do not imply a historical series.
- **[Large unfiltered results can create many Leaflet layers]** A single zone/classification interaction can still match most of the orchard → Reuse efficient circle markers/layer groups, update markers in one pass and keep the RPC projection minimal; profile representative data before considering clustering.
- **[Yellow markers can have weak contrast]** `M` may be difficult on light map tiles → Use a dark contrasting outline and textual/accessible classification labels.
- **[Editable values can make a previous calculation stale]** A total could otherwise remain visible after inputs change → Invalidate the result on every dependency change and require an explicit new click.
- **[Short-lived cached reads may briefly lag a just-completed mobile sync]** The desktop has no write event with which to invalidate the cache → Keep the TTL short and parameterized; retrying/reapplying a filter must permit a fresh request after expiry.
- **[Migration exists locally but not remotely]** The UI cannot query environments where the handoff has not been applied → Surface the RPC error cleanly and document deployment ordering and verification.

## Migration Plan

1. Implement and unit-test the domain/data/view-model slice and reusable territorial map behavior without changing mobile code or remote Supabase state.
2. Add the versioned transactional migration for `get_harvest_forecasts(date, date, text[], uuid)` and statically verify signature, validation, time-zone predicates, grants and returned columns.
3. Add the route, menu entry and UI components, then validate initial territorial-only rendering, filters, markers, editable weights and calculation states.
4. Update `database.md` items 20 and 25 so the desktop process and database contract match the migration.
5. Run focused and full project validation plus strict OpenSpec validation. Deliver the migration for manual application; do not invoke a mutating Supabase MCP operation.

For rollback, revoke execution from `authenticated` and `service_role`, drop only `public.get_harvest_forecasts(date, date, text[], uuid)`, reload the PostgREST schema, and remove the Angular route/menu/slice independently. Existing `harvest_forecasts` rows and `sync_harvest_forecasts(jsonb)` remain untouched.

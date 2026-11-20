## 1. Database read contract and documentation

- [x] 1.1 Add `supabase/migrations/20261120120000_add_harvest_forecast_desktop_query.sql` with the transactional `get_harvest_forecasts(date, date, text[], uuid)` definition, parameter validation, inclusive São Paulo date bounds, plant join, stable ordering, hardened security, grants and rollback notes; verify the SQL does not mutate `harvest_forecasts`, `sync_harvest_forecasts` or remote Supabase state.
- [x] 1.2 Update `database.md` item 20 with the Desktop Previsão de Safra process and item 25 with the exact RPC signature, return contract, migration SQL/reference, permissions, deployment and rollback; verify the documented filters, columns and grants match the migration byte-for-contract.
- [x] 1.3 Add a static migration contract test or equivalent repository check covering required parameters, result columns, classification validation, time-zone predicates, `REVOKE`/`GRANT` and schema reload; verify it passes without connecting to or mutating Supabase.

## 2. Domain and data access

- [x] 2.1 Add harvest forecast domain types, classification labels/colors, default scenario matrices, finite non-negative weight validation and the pure subtotal/total calculation; verify unit tests cover all defaults, `N` exclusion, zero results, edited weights and invalid values.
- [x] 2.2 Implement the harvest forecast service call through the existing Supabase request abstraction with optional RPC arguments and a parameter-derived short-lived cache key; verify service unit tests cover omitted/populated parameters, array forwarding, response mapping and errors.
- [x] 2.3 Implement the harvest forecast repository with result/loading/error signals and monotonically increasing latest-request-wins protection; verify repository unit tests prove stale successes and stale errors cannot replace the current result.

## 3. View model and Leaflet behavior

- [x] 3.1 Implement the route-scoped harvest forecast view model with filter signals, initial territorial-only state, inverted-period validation, filter-interaction gating, request composition, Realista default scenario, editable matrices and calculation invalidation; verify unit tests cover every state transition and explicit calculation formula.
- [x] 3.2 Reuse the farm boundary and zone repositories to load and fit all valid polygons independently from forecast markers; verify view-model/map tests prove polygons remain visible on initial, result, empty, cleared and error states.
- [x] 3.3 Implement forecast marker layer updates from current plant coordinates with one marker per `plant_id`, the `N/P/M/G/GG` color mapping, accessible label data and zone/general fitting behavior; verify unit tests cover each color, duplicate prevention, invalid coordinates and layer cleanup.
- [x] 3.4 Implement map initialization, resize/fullscreen cleanup and batched marker rendering consistent with `/meu-pomar`; verify component tests cover full-size rendering, map initialization, size invalidation and destruction.

## 4. Forecast interface

- [x] 4.1 Create the responsive Previsão de Safra shell with the `/meu-pomar` panel widths and flexible map area, using self-closing Angular component tags; verify a component test covers desktop proportions, narrow layout and absence of horizontal overflow classes.
- [x] 4.2 Create the left filter panel with labelled start/end date pickers, a classification select defaulting to **Todas**, zone select and clear behavior using the existing input/select styling; verify component tests cover labels, options, focus progression, invalid-period feedback and emitted filter changes.
- [x] 4.3 Add the scenario selector and keyboard-editable 4×3 kg/pé parameter table with 44 px spinner-free numeric inputs, selected-column emphasis and accessible invalid-cell feedback; verify component tests cover all 12 defaults, edits, validation, pointer/focus affordances and light/dark surface classes.
- [x] 4.4 Add the **Previsão** action and result card with persistent color/name labels, empty placeholders before calculation, per-class quantity/weight/subtotal details, emphasized total and pt-BR kg formatting; verify component tests cover empty, populated, zero-only and invalidated states.
- [x] 4.5 Add the map legend plus explicit loading, empty and recoverable error feedback without relying only on marker color; verify accessibility-oriented component tests cover code/name/color associations, accessible names, visible focus classes and retry path.

## 5. Navigation and integration

- [x] 5.1 Register the authenticated lazy `/previsao-de-safra` route and insert exactly one top-level **Previsão de Safra** menu item immediately below the `Mipd` group; verify route and menu unit tests pin the path, label, target, icon family and ordering.
- [x] 5.2 Add an integration-style test that starts with territory only, changes filters, receives classified plants, edits a scenario weight, calculates totals and then invalidates the card after another input change; verify the full flow passes without a live Supabase connection.
- [x] 5.3 Run the affected Vitest specs, complete test suite, lint and production build, resolving regressions while preserving unrelated worktree changes; record any environment-only validation limitation in the implementation handoff.
- [x] 5.4 Run `openspec validate add-harvest-forecast-desktop-view --strict`, verify every migration/documentation/UI/test task is complete, and confirm no Supabase MCP mutation was performed.

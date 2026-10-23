## 1. Database read contract

- [x] 1.1 Inspect the live/documented MIPD prerequisites (`field_operations`, `operation_types`, `mipd_markings`, `plants`, `zones`, `occurrence_types` and Storage policies) read-only and verify the implementation assumptions, including the persisted `source = 'mpid'` contract.
- [x] 1.2 Replace the root `migration.sql` handoff with an idempotent transaction that creates `get_mipd_operations(date, date, uuid)`, revokes `PUBLIC`/`anon`, grants `authenticated`, permits authenticated reads from the private MIPD photo bucket (including anonymous mobile uploads), and verify the SQL contains all required result columns, category/source predicates, São Paulo date filtering and deterministic newest-first ordering.
- [x] 1.3 Update `database.md` with the RPC catalog entry, Storage read policy, a Desktop MIPD process section and the complete function/grant/policy SQL in item 25, then verify its contract and permissions match `migration.sql` exactly.

## 2. Domain and data access

- [x] 2.1 Add the MIPD operation/marking domain models and plant-part labels, then add unit tests proving all RPC fields, nullable photo handling and LEAF/BRANCH/TRUNK/ROOT/FRUIT translations are represented correctly.
- [x] 2.2 Implement the MIPD service RPC request through the existing operations cache namespace and lazy signed-photo URL creation for `mipd-plant-photos`; verify unit tests cover optional RPC arguments, cache keys, signing lifetime, no-photo behavior and Storage errors.
- [x] 2.3 Implement the MIPD repository with result/error signals and latest-request-wins protection; verify unit tests prove stale success/error responses cannot replace the current filter result.

## 3. View-model and map behavior

- [x] 3.1 Implement the MIPD view model with today defaults, `PEST_DISEASE` catalog options, reactive querying and clear-filter behavior; verify unit tests cover category filtering, valid filter arguments, result clearing and error/empty states.
- [x] 3.2 Implement Leaflet initialization, farm-boundary rendering, canvas markers grouped by plant, result bounds and cleanup; verify unit tests cover one marker per plant, newest-first grouping, map fitting and marker selection.
- [x] 3.3 Implement selected-marking history and lazy photo state with selection request tokens; verify unit tests cover previous/next bounds, selection clearing, no-photo/unavailable states and prevention of a late signed URL attaching to another marking.

## 4. MIPD interface

- [x] 4.1 Create the MIPD screen shell and filter panel using self-closing component tags and the exact Operations layout/classes for desktop, narrow viewport, dark mode and clear filters; verify component tests assert the labels, controls, ordering and structural style classes.
- [x] 4.2 Create the MIPD map component with the Operations-equivalent map surface and full-screen control; verify component tests cover initialization, toggle labels, map invalidation and body overflow restoration.
- [x] 4.3 Create the right-side MIPD details card showing plant ID, coordinates, observation date, occurrence name, affected parts and photo/no-photo/error states, plus history navigation; verify component tests cover each rendered state and closing without clearing filters.
- [x] 4.4 Add explicit loading, empty-result and recoverable-error feedback without obscuring map controls, and verify tests cover transitions between loading, success, empty and failure.

## 5. Navigation and integration

- [x] 5.1 Register the authenticated `/mipd` lazy route and add the `Mipd` sidebar item immediately below Operações with an appropriate icon; verify route and sidebar unit tests assert availability, exact path, label and ordering.
- [x] 5.2 Add an integration-style component test that selects a pest/disease, receives repeated markings for one plant, clicks its marker, navigates history and renders a signed photo while retaining the active filters.
- [x] 5.3 Run the affected unit tests, the complete test suite, static analysis/lint and production build; fix regressions and verify the pre-existing unrelated login template modification remains untouched.
- [x] 5.4 Run `openspec validate add-mipd-desktop-view --strict` and verify all artifacts and implementation tasks are complete while leaving `migration.sql` ready for the user to execute manually in the Supabase SQL Editor.
- [x] 5.5 Make `Todos` the default pest/disease option and query every `PEST_DISEASE` marking when only a valid date range is selected; verify the view-model and filter-panel tests cover the behavior.
- [x] 5.6 Keep the farm and all valid zone polygons permanently rendered below MIPD markers, include them in map bounds, and verify ordered region coordinates plus filter-independent visibility in unit tests.
- [x] 5.7 Add the `Todas as zonas` filter, propagate its optional UUID through the MIPD data slice, create `migration_mipd_zone_filter.sql` for the four-argument RPC, update `database.md` and verify UI/data/SQL contracts with tests.
- [x] 5.8 Focus the map immediately on the selected zone polygon, preserve that focus when filtered markers arrive, restore general bounds for `Todas as zonas`, and cover the selected-zone bounds in a unit test.

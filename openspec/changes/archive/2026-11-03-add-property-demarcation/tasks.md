## 1. Database Contract and Documentation

- [x] 1.1 Add an idempotent Supabase migration under `supabase/migrations/` defining `public.replace_farm_boundary(p_points jsonb) returns integer`, complete payload/range/distinct-point validation, serialized atomic delete-and-insert behavior, contiguous ordinality, fixed search path, and authenticated-only execute grants; verify the SQL supports both successful replacement and rollback on an invalid payload.
- [x] 1.2 Update `database.md` section 18 with the RPC catalog contract, section 20 with the complete `/cadastro/propriedade` process, and section 25 with the canonical function/grants plus executable migration and rollback details; verify the documented signature and SQL match the migration exactly.
- [x] 1.3 Defer remote Supabase application and live privilege verification per the user's direction on 2026-11-03; keep the reviewed migration ready for a future deployment without making remote changes.

## 2. Domain and Data Layer

- [x] 2.1 Add or refine the farm-boundary domain types and ordered-coordinate validation/normalization utilities, including finite range checks and at least three distinct vertices; verify focused unit tests cover valid, invalid, duplicate, and out-of-order inputs.
- [x] 2.2 Extend the farm boundary data service with the `replace_farm_boundary` RPC payload/response mapping, reference-data cache invalidation on success, and no invalidation on failure; verify service unit tests assert payload order, returned count, refresh behavior, and error propagation.
- [x] 2.3 Add a property-demarcation view-model that loads the persisted boundary, tracks one finalized candidate, validates manual coordinates, orchestrates save/reload, and preserves the candidate after errors; verify unit tests cover empty/existing load, valid/invalid focus, successful save, and retryable failure state.

## 3. Map and Screen UI

- [x] 3.1 Extract or additively extend the `/dados-basicos` polygon-map behavior to support a single external polygon, fit-to-bounds, ordered drawing, implicit closure, undo/clear/finalize, and programmatic coordinate focus without mutating the polygon; verify map component unit tests cover each behavior and existing `/dados-basicos` tests remain green.
- [x] 3.2 Build the map-focused property-demarcation view with latitude/longitude inputs, focus action, drawing controls, save state, loading state, and success/error feedback, using self-closing syntax for imported components; verify component tests cover control state, validation messages, save eligibility, and retained candidate after RPC failure.
- [x] 3.3 Verify the rendered screen with no stored boundary and with an existing boundary; confirm the latter plots one closed polygon in persisted order and zooms to show its complete bounds.

## 4. Routing and Navigation

- [x] 4.1 Register the lazy-loaded `/cadastro/propriedade` child route and add the `Demarcação propriedade` entry at the specified position in the Cadastro submenu; verify route and menu unit tests assert path, label, icon, order, and authenticated layout nesting.

## 5. Integrated Validation

- [x] 5.1 Run the targeted unit-test suites for farm data, property view-model/view, map drawing, routes, menu, and `/dados-basicos` regression coverage; verify all targeted tests pass.
- [x] 5.2 Run the repository-wide static analysis, test, and production build commands; verify they complete without errors or new warnings attributable to this change.
- [x] 5.3 Defer the authenticated remote smoke check per the user's direction on 2026-11-03; retain the passing component/view-model integration coverage for focus, ordered drawing, save/reload orchestration, and automatic boundary framing.

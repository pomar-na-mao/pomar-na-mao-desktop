## 1. Database Contracts

- [x] 1.1 Inspect live Supabase definitions for `public.farm`, `public.regions`, `public.get_home_dashboard_snapshot`, and `public.get_zone_regions` via MCP and verify the inspected columns/functions match the implementation assumptions.
- [x] 1.2 Update `public.get_home_dashboard_snapshot` to return `farmBoundary` ordered by `public.farm."order"` and verify a direct RPC call returns existing `summary`, existing `plants`, and the new `farmBoundary` array without breaking the prior response shape.
- [x] 1.3 Verify `public.get_zone_regions` returns `id`, `zone_id`, `region`, `latitude`, `longitude`, and `"order"` ordered by `"order"`; if it does not, update the RPC and verify a direct call for a zone returns points in ascending order.
- [x] 1.4 Update `database.md` with every changed RPC body and response shape and verify the document includes `farmBoundary`, quoted `"order"` usage, and any final `get_zone_regions` SQL changes.

## 2. Frontend Data Model And Services

- [x] 2.1 Add a reusable ordered-boundary model/helper for latitude, longitude, and order points and verify unit tests cover unordered input, invalid coordinates, invalid order values, and fewer-than-three-point boundaries.
- [x] 2.2 Extend `HomeDashboardSnapshot` and `HomeDashboardService` mapping to include `farmBoundary` and verify `home-dashboard-service` unit tests pass for present, missing, empty, and unordered farm boundary data.
- [x] 2.3 Expose selected-zone ordered region loading through the Dashboard data layer using the existing regions repository/service path and verify repository/service tests assert `order` is preserved and sorted defensively.

## 3. Dashboard Map Behavior

- [x] 3.1 Update `DashboardViewModel` to render the farm polygon after the initial snapshot loads and verify a unit test or focused component test confirms the farm polygon is attempted only when a valid boundary exists.
- [x] 3.2 Update zone selection handling to fetch ordered region points, cache them by `zoneId`, render the selected zone polygon from the ordered points, and verify tests cover unordered response data and invalid selected-zone boundaries.
- [x] 3.3 Align zone-based plant filtering with the ordered selected-zone polygon and verify tests cover plants inside/outside the ordered polygon and the no-valid-polygon fallback.
- [x] 3.4 Keep map rendering stable when farm or zone boundary loading fails and verify tests assert plants and existing dashboard state remain usable after boundary errors.

## 4. Verification

- [x] 4.1 Run the relevant Angular unit tests for Dashboard, home dashboard service/repository, regions service/repository, and boundary helpers and verify they pass.
- [x] 4.2 Run the project static checks and verify there are no new TypeScript, Angular template, lint, or formatting errors.
- [ ] 4.3 Manually open `/inicio`, verify the farm polygon appears on initial load, select at least one Zona, and verify the zone polygon follows the collected point order.
- [x] 4.4 Validate the OpenSpec change with `openspec validate plot-ordered-dashboard-polygons --strict` and verify it passes.

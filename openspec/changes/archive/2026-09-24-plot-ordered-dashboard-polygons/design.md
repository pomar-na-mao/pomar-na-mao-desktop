## Context

See `proposal.md` for motivation. The Dashboard currently loads plants through `public.get_home_dashboard_snapshot` and loads zone filter options from `zones` with `id,name,polygon`. Zone selection renders `zone.polygon` directly and uses that same geometry for point-in-polygon filtering. The codebase already has `Region.order` and `RegionsRepository.sortZoneRegions`, but `/inicio` does not use the ordered `regions` vertices for the selected zone polygon. The initial snapshot does not expose the new `farm` boundary points.

## Goals / Non-Goals

**Goals:**
- Render selected zone polygons from ordered `regions` vertices instead of relying on the existing `zones.polygon` response.
- Render the farm boundary during the initial Dashboard load.
- Keep latitude/longitude handling explicit: Leaflet layers use `[latitude, longitude]`; GeoJSON helpers use `[longitude, latitude]`.
- Document any changed Supabase RPC body in `database.md`.
- Cover boundary ordering and invalid-boundary behavior with unit tests.

**Non-Goals:**
- Creating or editing the `farm` table; it already exists per the request.
- Reworking the Dashboard filter UI.
- Changing zone creation workflows except where an existing RPC must preserve or return ordered region points.

## Decisions

### 1. Extend the Dashboard snapshot with the farm boundary

Update `public.get_home_dashboard_snapshot` to include a `farmBoundary` array built from `public.farm`, selecting `latitude`, `longitude`, and quoted `"order"` sorted ascending. The frontend maps this into `HomeDashboardSnapshot.farmBoundary`.

Alternative considered: add a separate `FarmService.findBoundary()` request during `/inicio` load. That avoids touching the RPC, but it adds another request to the initial Dashboard path and weakens the current pattern where the snapshot owns initial map data. Because the farm polygon must appear on screen open, including it in the snapshot keeps the initial map contract cohesive.

Database impact: apply the RPC change through Supabase, then update `database.md` with the new `get_home_dashboard_snapshot` body and expected response shape. If the live RPC already differs from local migrations, inspect it with the Supabase MCP before replacing it.

### 2. Load selected zone vertices from `regions` on demand

When `filterZoneId` changes, request the selected zone's region points through the existing `RegionsRepository.findByZoneId(zoneId)` path, then build a polygon from valid points sorted by `order`. Keep a small in-memory cache keyed by `zoneId` in the Dashboard view model or repository layer to avoid refetching the same zone during one session.

Alternative considered: include all zone region points in `getFilterOptions()`. That makes selection instant, but it can bloat reference-data payloads and cache entries as zones grow. On-demand loading is a better fit for the current UI because only one selected zone polygon is rendered at a time.

Database impact: verify `public.get_zone_regions` returns `id`, `zone_id`, `region`, `latitude`, `longitude`, and `"order"`. If it does not order by `"order"` or does not expose the column, update the RPC and document its body in `database.md`. The frontend still sorts defensively so behavior remains correct even if response order changes.

### 3. Use shared boundary mapping helpers

Add a small pure helper for map boundaries that:
- drops points with non-finite latitude, longitude, or order
- sorts by numeric order ascending
- requires at least three points
- returns both Leaflet lat-lng tuples for rendering and GeoJSON coordinates for filtering when needed

Use it for both farm and selected-zone polygons. This keeps tests focused and avoids duplicating boundary validation in the view model.

Alternative considered: build the Leaflet polygon inline in the view model. That is quicker, but harder to test and more likely to duplicate the latitude/longitude ordering rules.

### 4. Keep plant filtering behavior aligned with the displayed zone polygon

When an ordered selected-zone boundary is available, use its GeoJSON polygon for zone-based plant filtering and rendering. If the ordered boundary cannot form a polygon, do not render the zone polygon and do not apply a broken client-side polygon filter.

Alternative considered: keep filtering by `zones.polygon` while rendering `regions`. That can make the displayed polygon and filtered plant set disagree when the stored zone polygon differs from the ordered vertices.

## Risks / Trade-offs

- Live database schema differs from repository assumptions -> Inspect `regions`, `farm`, `get_zone_regions`, and `get_home_dashboard_snapshot` with the Supabase MCP before applying SQL; reflect the final SQL in `database.md`.
- `"order"` is a reserved-ish identifier and easy to mishandle -> Quote it in SQL and map it to `order` only at the TypeScript boundary.
- Extra zone request on filter change can feel delayed -> Show existing map/plants while the boundary loads, cache successful responses by `zoneId`, and render the polygon once available.
- Invalid or incomplete farm data could break initial map rendering -> Treat farm boundary as optional and skip only the farm polygon when fewer than three valid ordered points exist.
- Extending the snapshot changes a shared RPC contract -> Keep existing `summary` and `plants` shape unchanged, add only the new `farmBoundary` field, and update tests around missing/empty fields.

## Migration Plan

1. Inspect live Supabase contracts with MCP: `public.farm`, `public.regions`, `public.get_home_dashboard_snapshot`, and `public.get_zone_regions`.
2. Update RPC SQL only where needed:
   - add `farmBoundary` to `get_home_dashboard_snapshot`
   - ensure `get_zone_regions` exposes and/or orders by `"order"` if the live body does not already do so
3. Update `database.md` with every altered RPC body and response example.
4. Update TypeScript models, services/repositories, map boundary helper, and Dashboard view model.
5. Add unit tests for snapshot farm mapping, zone/farm ordering, invalid boundaries, and selected-zone region loading.
6. Run Angular tests and static checks.

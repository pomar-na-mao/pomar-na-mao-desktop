## Supabase Call Inventory

| Flow | Service operation | Supabase target | Classification |
| --- | --- | --- | --- |
| Alerts | `findAll` | `alerts` table | Filtered read |
| Alerts | `findById` | `alerts` table | Filtered read |
| Dashboard | `getSnapshot` | `get_home_dashboard_snapshot` RPC | Screen snapshot |
| Dashboard | `getFilterOptions` | `zones` table | Reference data |
| Dashboard | `getFilterOptions` | `occurrence_types` table | Reference data |
| Dashboard | `getOpenOccurrences` | `get_open_occurrences` RPC | Volatile read |
| Home statistics | `getHomeStats` | `get-home-stats` Edge Function | Screen snapshot |
| Home statistics | `getRecentUpdates` | `plants` table | Volatile read |
| Mass inclusion | `findPlantsInsidePolygon` | `find_plants_inside_polygon` RPC | Filtered read |
| Mass inclusion | `findVarietyOptions` | `varieties` table | Reference data |
| Mass inclusion | `findOccurrenceTypeOptions` | `occurrence_types` table | Reference data |
| Mass inclusion | `syncPolygonBulkUpdate` | `sync_polygon_bulk_update` RPC | Mutation |
| Operations | `getSprayingOperations` | `get_spraying_operations` RPC | Filtered read |
| Operations | `getInspectionOperations` | `get_inspection_operations` RPC | Filtered read |
| Operations | `getAnnotationOperations` | `get_annotation_operations` RPC | Filtered read |
| Plants | `findAll` | `plants` table | Filtered read |
| Plants | `findById` | `plants` table | Filtered read |
| Plants | `delete` | `plants` table | Mutation |
| Plants | `insert` | `plants` table | Mutation |
| Plants | `getTotalCount` | `plants` table | Volatile read |
| Plants | `getAliveCount` | `plants` table | Volatile read |
| Plants | `getUpdatedCount` | `plants` table | Volatile read |
| Plants | `getLatestUpdatedAt` | `plants` table | Volatile read |
| Regions | `findAll` | `regions` table | Reference data |
| Regions | `findById` | `regions` table | Reference data |
| User roles | `findByUserId` | `user_roles` table | Filtered read |
| Users | `findById` | `users` table | Filtered read |
| Zones | `findAll` | `zones` table | Reference data |
| Zones | `findById` | `zones` table | Reference data |

Authentication API calls are not table, RPC, or Edge Function calls and are outside
this change.

## Call-count Baseline and Result

Counts below represent Supabase HTTP calls for the same logical flow in one app
session. Cold-load counts are unchanged where reducing them would require a
database contract change.

| Flow | Before | After |
| --- | ---: | ---: |
| Dashboard cold load | 4 | 4 |
| Dashboard equivalent reload within 15 seconds | 4 | 0 |
| Dashboard equivalent filter effect while request is pending | 1 | 0 additional |
| Operations selected type, first filter load | 1 | 1 |
| Operations equivalent filter reload within 15 seconds | 1 | 0 |
| Mass inclusion cold option load | 3 | 3 |
| Mass inclusion option load after first screen entry | 3 | 0 |
| Plant list, first filtered load | 1 | 1 |
| Equivalent plant list within 15 seconds | 1 | 0 |
| Four legacy plant counters, first load | 4 | 4 |
| Same four counters within 15 seconds | 4 | 0 |
| Zones, regions, varieties, or occurrence types after first load | 1 each | 0 each |

Successful plant insert/delete and `syncPolygonBulkUpdate` invalidate plant,
counter, dashboard, operation, and occurrence namespaces. Failed mutations keep
the existing cache. An invalidation that happens while a read is in flight also
prevents that stale response from entering the cache.

## Client-only Decisions

- Reference data uses cache-until-invalidation.
- Dashboard snapshots, open occurrences, operation filters, plant lists, plant
  counters, home statistics, and recent updates use a 15-second TTL.
- Polygon previews use in-flight deduplication only.
- Stable keys normalize object key order and omit undefined object properties.
- Operation repositories apply only the latest response for each operation type.
- The `/inicio` loading overlay is activated by the dashboard snapshot cache-miss
  callback, so a valid cached response renders without showing `Carregando
  dados...`.
- Successful sign-in, sign-out, and matching auth-state events clear cached and
  in-flight reads so data cannot be reused across user sessions.
- Local metrics expose cache hits, deduplicated requests, and underlying requests
  without external telemetry.

## Supabase Proposals

No Supabase RPC, Edge Function, table, policy, permission, trigger, or migration
was changed.

The following ideas can reduce cold-load calls further, but are proposals only:

1. Extend or complement `get_home_dashboard_snapshot` with dashboard zones,
   occurrence types, and open occurrences. This can reduce a cold dashboard load
   from 4 calls to 1, but open-occurrence freshness should be decided first.
2. Add a mass-inclusion support-data RPC returning zones, varieties, and
   occurrence types. This can reduce the first option load from 3 calls to 1,
   while client caching already makes later entries cost 0 calls.
3. Keep the three operation RPCs separate while the UI displays one operation
   type at a time. A unified RPC is only justified if a future screen needs
   multiple types simultaneously.
4. Do not add a plant-counter RPC now. The individual counter methods have no
   current UI consumers, and `get-home-stats` already provides a consolidated
   snapshot for the active statistics flow.

Because this implementation is client-only, `database.md` was not created or
updated.

## Context

The existing Angular mass inclusion screen already contains the map, polygon selection, region filtering, and form fields. Its current persistence path saves polygon coordinates and calls `mass_update_plants_in_polygon` with legacy values: occurrence boolean keys, a variety string, planting date, life-of-tree text, and description.

`database-and-features-organization.md` item 20.7 defines the new web flow: find plants inside a polygon, require user review, submit selected plants and selected changes to Supabase, and persist the operation across `field_operations`, `field_operation_areas`, `plant_operation_history`, `plant_occurrences`, `plants`, and `plant_attribute_change_history`.

Supabase supports calling Postgres functions through `supabase.rpc()`, so the Angular service layer should keep database mutation logic behind RPC calls rather than issuing many table writes directly from the browser.

## Goals / Non-Goals

**Goals:**
- Preserve the existing map, polygon generation, and mass inclusion form interaction.
- Add a preview/review state based on `find_plants_inside_polygon` before any mutation.
- Convert polygon coordinates to GeoJSON Polygon payloads expected by the new RPCs.
- Load varieties and occurrence types from Supabase tables and store selected IDs/codes, not static frontend-only values.
- Call one or more RPCs based on the submitted data:
  - Attribute data selected: update `plants` and write `plant_attribute_change_history`.
  - Occurrences selected: write `plant_occurrences`, `plant_operation_history`, and `field_operations`.
  - Both selected: execute both data paths as one confirmed bulk operation.
- Ensure the operation type/name recorded for the bulk flow is `Inserção em massa`.
- Provide typed request/response models and tests around payload construction and conditional RPC orchestration.

**Non-Goals:**
- Rebuild the existing map or polygon drawing component.
- Replace the current Angular state approach with a global state library.
- Implement offline/SQLite synchronization for this web-only flow.
- Change unrelated dashboard, settings, users, or authentication behavior.

## Decisions

1. Keep polygon and form UI, add review state around them.
   - Rationale: the user explicitly stated the map, polygon generation, and mass-association form already exist.
   - Alternative considered: rebuild the screen around a new wizard. That adds churn without improving the database adaptation.

2. Use `find_plants_inside_polygon` for preview before save.
   - Rationale: item 20.7 requires preview and review before mutation. It also gives the UI concrete plant IDs for the final payload.
   - Alternative considered: send only polygon coordinates to the mutation RPC and let the database decide silently. That skips the mandatory review step.

3. Use a service-level orchestrator for conditional RPC calls.
   - Rationale: the frontend must decide whether the request contains plant attributes, occurrences, or both. Keeping this in `MassInclusionService` makes it testable and keeps the view-model focused on UI state.
   - Alternative considered: one large view-model method that calls Supabase directly. That would couple UI state to persistence details.

4. Prefer a single database transaction for mixed submissions.
   - Rationale: when attribute and occurrence changes are submitted together, the operation must not partially save. The best implementation is one confirmed-save RPC that branches internally, or a wrapper RPC that invokes the attribute/occurrence subroutines transactionally.
   - Alternative considered: the browser calls separate mutation RPCs sequentially for mixed submissions. That supports "one or more RPCs" but risks partial success if the second call fails.

5. Represent the operation as `Inserção em massa` while keeping database codes stable.
   - Rationale: the user requested this operation type. Implementation should seed or resolve the relevant `operation_types` row and use it for `field_operations`.
   - Alternative considered: keep only the document's existing `polygon_bulk_update` label. That would conflict with the requested operation naming.

6. Do not write directly to `plants`, `plant_occurrences`, or history tables from Angular.
   - Rationale: RPCs centralize validation, operation creation, duplicate-open-occurrence handling, and transactional writes. This follows Supabase's Postgres function/RPC model and reduces browser-side consistency bugs.
   - Alternative considered: direct client table writes. That is harder to keep atomic and easier to drift from item 20.7 rules.

## Risks / Trade-offs

- [Risk] The requested conditional "one or more RPCs" can conflict with atomicity for mixed submissions -> Mitigation: implement either one transaction-wrapping save RPC or require the database RPC set to guarantee transactionality; tests should cover mixed payload failures.
- [Risk] The database may currently expose `polygon_bulk_update` but not an `Inserção em massa` operation type -> Mitigation: include a migration/seed task to verify and insert/update the operation type row before frontend integration.
- [Risk] Static occurrence and variety options may not map cleanly to remote IDs -> Mitigation: load `varieties` and `occurrence_types` from Supabase and submit IDs; keep labels only for display.
- [Decision] Keep `lifeOfTree` as a supported plant attribute because it maps to `plants.life_of_the_tree`; persist it through the same attribute history path as variety and planting date.
- [Risk] Existing polygon coordinates are `{ lat, lng }` but GeoJSON requires `[lng, lat]` and a closed ring -> Mitigation: add a converter utility with unit tests for ordering and closure.
- [Risk] Duplicate open occurrences could produce noisy maps -> Mitigation: require the RPC implementation to update an existing open occurrence for the same plant/type or otherwise document the chosen duplicate policy.
- [Risk] RLS or RPC permissions may block authenticated browser calls -> Mitigation: verify RPC grants/policies locally or against the configured Supabase project before marking implementation complete.

## Migration Plan

1. Verify the database has the required tables from item 20.7 and the PostGIS-dependent RPC `find_plants_inside_polygon`.
2. Add or update migration SQL for the confirmed-save RPC contract and the `Inserção em massa` operation type row if missing.
3. Update Angular models/service/repository/view-model to use the new preview and save contracts.
4. Replace static variety/occurrence option sources with Supabase-backed sources.
5. Run TypeScript, lint, unit tests, and at least one RPC smoke test with a small polygon payload.

## Open Questions

- Should the database code remain `polygon_bulk_update` with display name `Inserção em massa`, or should a new operation code be introduced? The implementation should inspect existing `operation_types` before deciding.
- Should attribute-only submissions still create `plant_operation_history` rows for every selected plant? Item 20.7 suggests yes for confirmed plants, but the user specifically emphasized this table for occurrences.
- Should `description` remain in the form for this flow, or should notes become operation-only metadata? Current implementation keeps it as operation/occurrence notes and does not write it to `plants`.

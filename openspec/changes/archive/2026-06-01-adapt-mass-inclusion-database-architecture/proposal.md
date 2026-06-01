## Why

The current mass inclusion flow already has the web map, polygon selection, and form, but its persistence layer still targets the old plant-column model through `mass_update_plants_in_polygon`. The flow needs to follow `database-and-features-organization.md` item 20.7, using the new Supabase/Postgres architecture for plants, occurrences, operation history, and bulk operation audit records.

## What Changes

- Keep the existing map, polygon generation, and mass inclusion form as the starting point.
- Add a required preview step that calls `find_plants_inside_polygon` and lets the frontend keep/review selected plants before saving.
- Replace the old `mass_update_plants_in_polygon` call with a new orchestration that calls one or more Supabase RPCs depending on selected data:
  - Plant attribute updates, such as variety, life-of-tree, and/or planting date, update `plants` and write `plant_attribute_change_history`.
  - Occurrence selections write `plant_occurrences`, `plant_operation_history`, and `field_operations`.
  - Mixed submissions apply both paths in one confirmed save flow.
- Ensure the saved field operation uses operation type/name `Inserção em massa`.
- Use Supabase RPC calls from the Angular service/repository layer with typed payload/result models.
- Load selectable varieties and occurrence types from the database instead of static frontend arrays.
- Preserve atomicity for each confirmed operation and surface actionable errors in the UI.

## Capabilities

### New Capabilities
- `mass-inclusion-polygon-bulk-update`: Defines the adapted mass inclusion flow for previewing plants in a polygon and applying database-backed bulk updates through conditional Supabase RPC calls.

### Modified Capabilities

## Impact

- Affected frontend code includes `src/app/ui/views/mass-inclusion`, `src/app/ui/components/mass-inclusion`, `src/app/ui/view-models/mass-inclusion`, `src/app/data/repositories/mass-inclusion`, `src/app/data/services/mass-inclusion`, and `src/app/domain/models/mass-inclusion.ts`.
- New or updated data access may be needed for `varieties` and `occurrence_types`.
- Supabase/Postgres work may include migrations or validation for RPCs such as `find_plants_inside_polygon` and the confirmed-save RPC(s), plus operation type seed data for `Inserção em massa`.
- Affected remote tables include `plants`, `plant_occurrences`, `plant_operation_history`, `field_operations`, `field_operation_areas`, and `plant_attribute_change_history`.

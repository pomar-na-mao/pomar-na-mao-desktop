## 1. Database Contract

- [x] 1.1 Verify current Supabase schema for `plants`, `varieties`, `occurrence_types`, `field_operations`, `field_operation_areas`, `plant_operation_history`, `plant_occurrences`, and `plant_attribute_change_history`.
- [x] 1.2 Verify whether `operation_types` already has the operation code/name that should display as `Inserção em massa`; add or update seed/migration SQL if missing.
- [x] 1.3 Verify `find_plants_inside_polygon` exists and returns plant ID, coordinates, zone, variety, and planting date fields required by item 20.7.
- [x] 1.4 Define the confirmed-save RPC contract for attribute-only, occurrence-only, and mixed submissions, preserving atomicity for mixed submissions.
- [x] 1.5 Add or update migration SQL for the confirmed-save RPC(s), including writes to `field_operations`, `field_operation_areas`, `plant_operation_history`, `plant_occurrences`, `plants`, and `plant_attribute_change_history`.
- [x] 1.6 Verify RLS/grants allow authenticated frontend users to execute the required RPCs without exposing direct unsafe table writes.

## 2. Frontend Models and Data Access

- [x] 2.1 Replace legacy mass update request/result types with typed models for polygon preview plants, selected plants, occurrence options, variety options, bulk update payload, and bulk update result.
- [x] 2.2 Add a tested converter from selected `{ lat, lng }` polygon coordinates to a closed GeoJSON Polygon using `[lng, lat]` coordinate order.
- [x] 2.3 Update `MassInclusionService` to call `find_plants_inside_polygon` through `supabase.rpc()`.
- [x] 2.4 Update `MassInclusionService` to orchestrate the confirmed-save RPC path based on selected attributes and/or occurrences.
- [x] 2.5 Update `MassInclusionRepository` to expose preview, selected-plant review, option loading, and confirmed-save methods.
- [x] 2.6 Add Supabase-backed data access for `varieties` and `occurrence_types` options used by the mass inclusion form.

## 3. View Model and UI Flow

- [x] 3.1 Update `MassInclusionViewModel` to load database-backed varieties and occurrence types when the screen initializes.
- [x] 3.2 Add preview state for plants found, selected plants, loading/error status, and submission result.
- [x] 3.3 Add a preview action that validates the polygon, calls the preview RPC, and stores returned plants as selected by default.
- [x] 3.4 Add review controls so the user can remove plants from the confirmed selection.
- [x] 3.5 Block confirmation until preview is loaded, at least one plant is selected, and at least one supported change is selected.
- [x] 3.6 Update the confirm action to build the new payload and call the repository confirmed-save method.
- [x] 3.7 Preserve existing polygon drawing and form controls; avoid replacing the map or form components except where needed to connect the new flow.
- [x] 3.8 Show success counts or operation summary on success and keep review state available after errors.

## 4. Tests and Verification

- [x] 4.1 Add unit tests for polygon-to-GeoJSON conversion, including closed ring and coordinate ordering.
- [x] 4.2 Add service/repository tests for preview RPC payload and confirmed-save conditional RPC orchestration.
- [x] 4.3 Add view-model tests for preview-required save blocking, no-selected-plants blocking, no-selected-changes blocking, success reset, and error retention.
- [x] 4.4 Run TypeScript validation.
- [x] 4.5 Run lint.
- [x] 4.6 Run automated tests.
- [x] 4.7 Run at least one Supabase RPC smoke test with a small polygon payload in the configured environment or local Supabase stack.

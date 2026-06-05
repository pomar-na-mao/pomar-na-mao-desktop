## 1. Contract and Models

- [x] 1.1 Add an occurrence action type with `add` and `remove` values to the mass inclusion domain models.
- [x] 1.2 Add `occurrenceAction` to `MassInclusionData`, `MassInclusionFormValue`, `EMPTY_MASS_INCLUSION_DATA`, and `PolygonBulkUpdatePayload`.
- [x] 1.3 Update repository/service tests that assert the payload sent to `sync_polygon_bulk_update`.

## 2. Database RPC and Documentation

- [x] 2.1 Add a Supabase migration replacing `sync_polygon_bulk_update(jsonb)` with support for `occurrenceAction`, defaulting missing values to `add`.
- [x] 2.2 Keep add mode behavior compatible with the current implementation, including open occurrence creation/update and existing audit writes.
- [x] 2.3 Implement remove mode so matching open `plant_occurrences` rows are updated to `status = 'resolved'` and non-matching plants are ignored.
- [x] 2.4 Preserve function grants/revokes for `authenticated`, `public`, and `anon`.
- [x] 2.5 Update `database-and-features-organization.md` with the new RPC payload field, add/remove logic, and result counter semantics.

## 3. Frontend UI and View Model

- [x] 3.1 Add a toggle control to the mass inclusion form for `Adicionar ocorrencia` and `Remover ocorrencia`.
- [x] 3.2 Wire the toggle into `MassInclusionViewModel`, form reset, current data mapping, and payload construction.
- [x] 3.3 Ensure add mode remains the default for existing user flows.
- [x] 3.4 Update success messaging so removal communicates resolved/updated occurrence counts clearly.

## 4. Tests and Validation

- [x] 4.1 Add view model tests for default add mode and explicit remove mode payload construction.
- [x] 4.2 Add tests for form reset and persisted mass inclusion data including `occurrenceAction`.
- [x] 4.3 Add SQL/RPC verification coverage or migration-level checks for add mode, remove mode with open matches, and remove mode without matches.
- [x] 4.4 Run the project test suite and lint/type checks used by this repository.

# zone-polygon-management Specification

## Purpose
Define the authenticated desktop workflow for creating and updating orchard zones from map polygons.

## Requirements
### Requirement: Zone polygon screen is available from authenticated navigation
The system SHALL provide an authenticated screen for creating or updating zones from a drawn polygon.

#### Scenario: User opens the zone polygon screen
- **WHEN** an authenticated user selects the sidebar entry below `Inclusoes em Massa`
- **THEN** the application MUST load the zone polygon management screen.
- **THEN** the screen MUST display a left-side data panel and a full-height map area consistent with `/inclusoes-em-massa`.

### Requirement: Existing zones are plotted before saving
The zone polygon management screen SHALL load existing zones and plot every zone with a valid polygon on the map before the user saves a new polygon.

#### Scenario: Existing zones load successfully
- **WHEN** the screen initializes
- **THEN** the system MUST request persisted zones from Supabase-backed data sources.
- **THEN** the map MUST plot all existing zone polygons with continuous outlines.
- **THEN** each plotted zone polygon SHOULD use a distinct color from the configured map palette.

#### Scenario: User starts drawing
- **WHEN** the user starts drawing a new zone polygon
- **THEN** existing zone polygons MUST remain plotted on the map.
- **THEN** the map SHOULD zoom to the current device location when available.

#### Scenario: Existing zones fail to load
- **WHEN** the existing zones request fails
- **THEN** the system MUST show an error state.
- **THEN** the save action MUST remain blocked until the user can validate the new zone against current persisted zones.

### Requirement: Zone details are collected before saving
The screen SHALL require a zone name and code before saving and MAY collect an optional description.

#### Scenario: User enters valid zone details
- **WHEN** the user fills a non-empty zone name and a non-empty code
- **THEN** the form MUST mark the zone details as valid unless the name duplicates another zone with a different code.

#### Scenario: User enters a duplicate zone name for a different code
- **WHEN** the user enters a name matching an existing zone name using case-insensitive comparison after trimming whitespace
- **AND** the current code does not match that existing zone code
- **THEN** the form MUST show a validation error.
- **THEN** no Supabase mutation MUST be called while the duplicate remains.

#### Scenario: User reuses an existing zone code
- **WHEN** the user enters a code matching exactly one existing zone
- **THEN** the save operation MUST update that zone's polygon points instead of creating a second zone record.

### Requirement: User draws one closed polygon for the zone
The screen SHALL allow the user to draw one polygon on the map using the same interaction pattern as mass inclusion.

#### Scenario: Polygon is completed
- **WHEN** the user adds at least 3 vertices and completes the polygon
- **THEN** the system MUST produce a closed GeoJSON Polygon using longitude-latitude coordinate order.
- **THEN** the screen MUST enable save only if the zone form is also valid.

#### Scenario: Polygon is incomplete
- **WHEN** the user has fewer than 3 vertices or clears the map
- **THEN** the system MUST keep the save action disabled.
- **THEN** no Supabase mutation MUST be called.

### Requirement: Zone and region points are persisted atomically
The persistence layer SHALL create or update the zone and its region points as one atomic Supabase operation.

#### Scenario: Zone creation succeeds for a new code
- **WHEN** the user confirms valid zone details and a closed polygon with a code that does not exist
- **THEN** the frontend MUST call the database contract for saving a zone with region points.
- **THEN** Supabase MUST create exactly one `zones` record for the new code.
- **THEN** Supabase MUST create one `regions` record per polygon vertex only after the `zones` insert succeeds.
- **THEN** each `regions.region` value MUST be saved with the zone code.

#### Scenario: Zone update succeeds for an existing code
- **WHEN** the user confirms valid zone details and a closed polygon with a code matching exactly one zone
- **THEN** Supabase MUST keep the existing `zones` record.
- **THEN** Supabase MUST update the zone fields and polygon.
- **THEN** Supabase MUST replace the `regions` points for that `zone_id` with the newly drawn points.
- **THEN** each `regions.region` value MUST be saved with the zone code.

#### Scenario: Region point persistence fails
- **WHEN** region point persistence fails after zone validation
- **THEN** the operation MUST not leave a persisted zone without its corresponding region points.
- **THEN** the frontend MUST show an error message and keep the drawn polygon/form available for retry.

### Requirement: Save feedback is visible and actionable
The screen SHALL expose loading, success and error states around the save action.

#### Scenario: Save is in progress
- **WHEN** the user confirms a valid zone save
- **THEN** the save button MUST be disabled while the request is pending.
- **THEN** the global loading screen MUST be shown using the same loading pattern as `/inicio`.
- **THEN** the UI MUST prevent duplicate submissions for the same in-flight request.

#### Scenario: Save succeeds
- **WHEN** the Supabase operation succeeds
- **THEN** the frontend MUST show a top-right toast with `Zona criada com sucesso`.
- **THEN** the frontend MUST refresh zones and regions.
- **THEN** the map MUST plot the saved zone together with the other zones.
- **THEN** the map MUST zoom to the saved zone after it is plotted.

#### Scenario: Save fails
- **WHEN** the Supabase operation returns an error
- **THEN** the UI MUST show a clear error message near the zone creation workflow.
- **THEN** the current name and polygon MUST remain available for correction or retry.

### Requirement: Database contract is documented
The database architecture document SHALL describe the zone polygon save contract anywhere the affected SQL or process summaries are maintained.

#### Scenario: Database documentation is updated
- **WHEN** this capability is implemented
- **THEN** `database.md` item 18 MUST document the zone save RPC.
- **THEN** `database.md` item 20 MUST document the web process for zone polygon save.
- **THEN** `database.md` item 22 MUST include the process summary.
- **THEN** `database.md` item 24 MUST include the affected drop SQL/details.
- **THEN** `database.md` item 25 MUST include the consolidated create SQL for `regions`, `zones` and the save RPC.

## ADDED Requirements

### Requirement: Zone polygon screen is available from authenticated navigation
The system SHALL provide an authenticated screen for creating zones from a drawn polygon.

#### Scenario: User opens the zone polygon screen
- **WHEN** an authenticated user selects the new sidebar entry below `Inclusoes em Massa`
- **THEN** the application MUST load the zone polygon management screen.
- **THEN** the screen MUST display a left-side data panel and a full-height map area consistent with `/inclusoes-em-massa`.

### Requirement: Existing zones are visible before saving
The zone polygon management screen SHALL load and display existing zones before the user saves a new zone.

#### Scenario: Existing zones load successfully
- **WHEN** the screen initializes
- **THEN** the system MUST request persisted zones from Supabase-backed data sources.
- **THEN** the left panel MUST show the existing zone names in a scannable list.

#### Scenario: Existing zones fail to load
- **WHEN** the existing zones request fails
- **THEN** the system MUST show an error state.
- **THEN** the save action MUST remain blocked until the user can validate the new zone against current persisted zones.

### Requirement: New zone details are collected before saving
The screen SHALL require a new zone name and MAY collect optional code and description fields supported by `zones`.

#### Scenario: User enters a valid zone name
- **WHEN** the user fills a non-empty zone name that does not duplicate an existing zone name
- **THEN** the form MUST mark the zone name as valid.

#### Scenario: User enters a duplicate zone name
- **WHEN** the user enters a name matching an existing zone name using case-insensitive comparison after trimming whitespace
- **THEN** the form MUST show a validation error.
- **THEN** no Supabase mutation MUST be called while the duplicate remains.

### Requirement: User draws one closed polygon for the new zone
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
The persistence layer SHALL create the zone and its region points as one atomic Supabase operation.

#### Scenario: Zone creation succeeds
- **WHEN** the user confirms a valid zone name and closed polygon
- **THEN** the frontend MUST call the database contract for creating a zone with region points.
- **THEN** Supabase MUST create exactly one `zones` record for the new zone.
- **THEN** Supabase MUST create one `regions` record per polygon vertex only after the `zones` insert succeeds.
- **THEN** the frontend MUST show a success message and refresh zones/regions reference data.

#### Scenario: Region point insertion fails
- **WHEN** region point insertion fails after zone validation
- **THEN** the operation MUST not leave a persisted zone without its corresponding region points.
- **THEN** the frontend MUST show an error message and keep the drawn polygon/form available for retry.

### Requirement: Database contract is documented
The database architecture document SHALL describe the zone polygon creation contract anywhere the affected SQL or process summaries are maintained.

#### Scenario: Database documentation is updated
- **WHEN** this change is implemented
- **THEN** `database.md` item 18 MUST document the creation RPC.
- **THEN** `database.md` item 20 MUST document the web process for zone polygon creation.
- **THEN** `database.md` item 22 MUST include the process summary.
- **THEN** `database.md` item 24 MUST include the affected drop SQL/details.
- **THEN** `database.md` item 25 MUST include the consolidated create SQL for `regions`, `zones` and the creation RPC.

### Requirement: Zone creation feedback is actionable
The screen SHALL expose loading, success and error states around the save action.

#### Scenario: Save is in progress
- **WHEN** the user confirms a valid zone creation
- **THEN** the save button MUST be disabled while the request is pending.
- **THEN** the UI MUST prevent duplicate submissions for the same in-flight request.

#### Scenario: Save fails
- **WHEN** the Supabase operation returns an error
- **THEN** the UI MUST show a clear error message near the zone creation workflow.
- **THEN** the current name and polygon MUST remain available for correction or retry.

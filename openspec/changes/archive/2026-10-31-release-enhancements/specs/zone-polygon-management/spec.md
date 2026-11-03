## MODIFIED Requirements

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
- **THEN** the map view MUST preserve focus on the farm area without overriding with device geolocation.

#### Scenario: Existing zones fail to load
- **WHEN** the existing zones request fails
- **THEN** the system MUST show an error state.
- **THEN** the save action MUST remain blocked until the user can validate the new zone against current persisted zones.

## ADDED Requirements

### Requirement: Map initializes centered on farm boundary lowest order point
The zone polygon management screen SHALL initialize the map centered and zoomed on the farm boundary from the `farm` table, selecting the coordinate of the lowest order point (`order = 1`).

#### Scenario: Map initial center on farm point order 1
- **WHEN** the zone polygon management screen at `/cadastro/zonas` is accessed
- **THEN** the system MUST fetch the farm boundary points from the `farm` table
- **THEN** the map MUST set its initial center coordinates to the boundary point having the lowest `order` (order = 1)
- **THEN** the map MUST NOT auto-center to the user device geolocation on initialization.

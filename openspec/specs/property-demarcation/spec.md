# property-demarcation Specification

## Purpose
Permitir que operadores autenticados visualizem, localizem, desenhem e substituam com segurança o perímetro georreferenciado da propriedade rural.

## Requirements

### Requirement: Property demarcation is map-focused
The property demarcation screen SHALL present a full-area map as its primary workspace and SHALL provide the controls needed to draw, clear, finish, and save one property polygon.

#### Scenario: User opens the property screen
- **WHEN** an authenticated user navigates to `/cadastro/propriedade`
- **THEN** the system MUST display the property demarcation map and polygon controls.
- **THEN** the screen MUST NOT require unrelated registration fields before the user can interact with the map.

### Requirement: Existing farm boundary is loaded and focused
The screen SHALL load `farm` vertices in ascending `order`, connect the last vertex back to the first, and fit the map to the resulting polygon whenever at least three valid stored vertices exist.

#### Scenario: Stored boundary exists
- **WHEN** the screen receives at least three valid farm vertices
- **THEN** it MUST render one closed property polygon using the persisted order.
- **THEN** it MUST adjust the map viewport so the complete polygon is visible.

#### Scenario: Stored boundary does not exist
- **WHEN** no valid farm boundary is stored
- **THEN** the screen MUST remain available for drawing a new polygon.
- **THEN** it MUST use the configured default map center and zoom.

### Requirement: Drawing produces one closed ordered polygon
The screen SHALL allow only one active property polygon, SHALL require at least three distinct vertices before finalization, and SHALL preserve the sequence in which the vertices were marked.

#### Scenario: User finishes a valid drawing
- **WHEN** the user marks at least three distinct points and finishes the drawing
- **THEN** the system MUST close the polygon by connecting the final point to the first point.
- **THEN** the candidate vertices MUST retain their marking sequence for persistence as orders `1` through `n`.

#### Scenario: User attempts to finish an invalid drawing
- **WHEN** fewer than three distinct vertices have been marked
- **THEN** the system MUST prevent polygon finalization and saving.

#### Scenario: User draws a replacement
- **WHEN** a saved or candidate polygon is already displayed and the user completes a new polygon
- **THEN** the new candidate MUST replace the previous candidate on the map.
- **THEN** only the new candidate MUST be eligible for saving.

### Requirement: Map can focus manually entered coordinates
The screen SHALL provide latitude and longitude fields and an action that centers and zooms the map on a valid coordinate without adding that coordinate to the property polygon.

#### Scenario: User focuses a valid coordinate
- **WHEN** the user provides latitude from `-90` through `90`, longitude from `-180` through `180`, and activates the focus action
- **THEN** the map MUST center on that coordinate at the configured detail zoom.
- **THEN** the current polygon and drawing order MUST remain unchanged.

#### Scenario: User provides an invalid coordinate
- **WHEN** either coordinate is missing, non-numeric, or outside its allowed range
- **THEN** the system MUST reject the focus action and show an actionable validation message.
- **THEN** the current map viewport and polygon MUST remain unchanged.

### Requirement: Saving atomically replaces the farm boundary
The system SHALL persist a finalized polygon through one authenticated database operation that validates the complete payload, deletes all existing `farm` rows, and inserts the new vertices with contiguous order values from `1` through `n` in a single transaction.

#### Scenario: Replacement succeeds
- **WHEN** an authenticated user saves a valid finalized polygon
- **THEN** all previously stored `farm` vertices MUST be removed.
- **THEN** the new vertices MUST be stored with generated UUIDs and `order` matching their marking sequence.
- **THEN** the operation MUST return the number of inserted vertices and the screen MUST show success and refresh the persisted polygon.

#### Scenario: Replacement fails
- **WHEN** payload validation or any delete or insert step fails
- **THEN** the entire database operation MUST roll back.
- **THEN** the previously stored boundary MUST remain unchanged and the candidate polygon MUST remain available for retry.

#### Scenario: Unauthorized caller attempts replacement
- **WHEN** an anonymous or otherwise unauthorized caller invokes the replacement operation
- **THEN** the database MUST deny the mutation.

### Requirement: Farm boundary cache reflects successful replacement
After a successful save, subsequent consumers SHALL be able to load the new farm boundary instead of receiving a stale cached perimeter.

#### Scenario: Boundary is saved successfully
- **WHEN** the replacement operation completes
- **THEN** the application MUST invalidate the relevant farm/reference-data cache.
- **THEN** the refreshed boundary MUST contain only the newly saved ordered vertices.

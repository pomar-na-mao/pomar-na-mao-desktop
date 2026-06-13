# mass-inclusion-polygon-bulk-update Specification

## Purpose
TBD - created by archiving change adapt-mass-inclusion-database-architecture. Update Purpose after archive.
## Requirements
### Requirement: Existing polygon and form workflow is preserved
The mass inclusion feature SHALL structure the screen with a left form sidebar and a full-height map on the right, and the Zone selector SHALL be integrated at the top of the left form sidebar.

#### Scenario: User prepares a bulk change
- **WHEN** the user opens the mass inclusion screen
- **THEN** the layout MUST display the form sidebar on the left and the map on the right.
- **THEN** the Zone selector MUST be displayed at the top of the left form sidebar.
- **THEN** the user MUST be able to select or generate a polygon using the map workflow.
- **THEN** the user MUST be able to fill the mass association form before previewing or saving.

### Requirement: Plant preview is required before saving
The mass inclusion feature SHALL call `find_plants_inside_polygon` with a GeoJSON Polygon and present the returned plants for review before any mutation RPC is called.

#### Scenario: Polygon preview succeeds
- **WHEN** the user has a valid polygon and requests preview
- **THEN** the frontend MUST send the polygon as GeoJSON to `find_plants_inside_polygon`.
- **THEN** the screen MUST show the number of plants found and allow the user to review the selected plants.

#### Scenario: Save attempted before preview
- **WHEN** the user attempts to confirm a save without a loaded preview
- **THEN** the system MUST block the save.
- **THEN** no mutation RPC MUST be called.

### Requirement: Only reviewed plants are submitted
The mass inclusion feature SHALL submit only plants that remain selected after review.

#### Scenario: User removes a plant from review
- **WHEN** a plant returned by preview is unselected before confirmation
- **THEN** that plant MUST NOT be included in the confirmed save payload.

### Requirement: Database-backed options are used
The mass inclusion form SHALL load varieties and occurrence types from Supabase-backed data sources instead of relying on static frontend arrays for persisted values.

#### Scenario: Options are loaded
- **WHEN** the mass inclusion screen initializes
- **THEN** the variety selector MUST use persisted variety IDs.
- **THEN** the occurrence selector MUST use persisted occurrence type IDs, codes, and names.

### Requirement: Conditional RPC orchestration is based on selected data
The mass inclusion persistence layer SHALL call only the RPC path required by the selected data and SHALL support mixed submissions.

#### Scenario: Only plant attributes are selected
- **WHEN** the confirmed payload contains a selected variety, life-of-tree, and/or planting date and no occurrences
- **THEN** the persistence layer MUST execute the plant-attribute update RPC path.
- **THEN** the operation MUST update `plants` and write `plant_attribute_change_history`.

#### Scenario: Only occurrences are selected
- **WHEN** the confirmed payload contains occurrences and no variety, life-of-tree, or planting date
- **THEN** the persistence layer MUST execute the occurrence update RPC path.
- **THEN** the operation MUST write `field_operations`, `plant_operation_history`, and `plant_occurrences`.

#### Scenario: Attributes and occurrences are selected together
- **WHEN** the confirmed payload contains both attributes and occurrences
- **THEN** the persistence layer MUST execute both data paths as one confirmed bulk operation.
- **THEN** the result MUST not leave a partial save if one path fails.

### Requirement: Bulk operation is recorded as Inserção em massa
Every confirmed mass inclusion save SHALL record its field operation with operation type/name `Inserção em massa`.

#### Scenario: Confirmed save creates operation
- **WHEN** a confirmed save succeeds
- **THEN** the associated `field_operations` record MUST reference an operation type/name of `Inserção em massa`.
- **THEN** the operation MUST be associated with the affected selected plants.

### Requirement: New database tables receive the correct writes
The confirmed mass inclusion save SHALL write to the tables required by the new database architecture according to the selected data.

#### Scenario: Occurrences are applied
- **WHEN** occurrences are selected for confirmed plants
- **THEN** records MUST be created or updated in `plant_occurrences` according to the duplicate-open-occurrence policy.
- **THEN** affected plants MUST be associated to the operation in `plant_operation_history`.

#### Scenario: Plant attributes are applied
- **WHEN** variety, life-of-tree, and/or planting date is selected for confirmed plants
- **THEN** `plants.variety_id`, `plants.life_of_the_tree`, and/or `plants.planting_date` MUST be updated.
- **THEN** each changed attribute MUST be recorded in `plant_attribute_change_history` with old and new values.

### Requirement: Empty or invalid submissions are blocked
The mass inclusion feature SHALL block mutation when there are no selected plants or no selected changes.

#### Scenario: No selected plants
- **WHEN** the preview has no selected plants
- **THEN** the confirm action MUST be disabled or rejected.
- **THEN** no mutation RPC MUST be called.

#### Scenario: No selected changes
- **WHEN** the user has selected plants but no occurrences, no variety, no life-of-tree, and no planting date
- **THEN** the confirm action MUST be disabled or rejected.
- **THEN** no mutation RPC MUST be called.

### Requirement: RPC responses and errors are surfaced
The mass inclusion feature SHALL expose success counts and actionable errors from RPC calls to the user.

#### Scenario: Confirmed save succeeds
- **WHEN** the mutation RPC path succeeds
- **THEN** the UI MUST show a success message including the affected plant count or operation summary.
- **THEN** the polygon/form state MUST be reset or refreshed consistently.

#### Scenario: Confirmed save fails
- **WHEN** any required RPC call returns an error
- **THEN** the UI MUST show an error message.
- **THEN** the local review state MUST remain available for correction or retry.

### Requirement: Occurrence action mode is selected for bulk occurrence changes
The mass inclusion feature SHALL allow the user to choose whether selected occurrence types are added to or removed from the selected plants.

#### Scenario: Add mode is selected
- **WHEN** the user selects occurrence types and chooses the add occurrence mode before confirming
- **THEN** the confirmed payload MUST identify the occurrence action as add.
- **THEN** the persistence layer MUST keep the existing behavior of creating or updating `plant_occurrences` with `status = 'open'`.

#### Scenario: Remove mode is selected
- **WHEN** the user selects occurrence types and chooses the remove occurrence mode before confirming
- **THEN** the confirmed payload MUST identify the occurrence action as remove.
- **THEN** the persistence layer MUST attempt to resolve matching open occurrences for each selected plant and occurrence type.

### Requirement: Bulk occurrence removal resolves only existing open occurrences
The mass inclusion persistence layer SHALL resolve matching open plant occurrences during bulk occurrence removal and SHALL ignore selected plants without a matching open occurrence.

#### Scenario: Matching open occurrence exists
- **WHEN** a selected plant has one or more `plant_occurrences` rows for the selected occurrence type with `status = 'open'`
- **THEN** the mutation RPC MUST update the matching rows to `status = 'resolved'`.
- **THEN** the resolved rows MUST remain associated with the confirmed field operation where the schema supports that association.

#### Scenario: Matching open occurrence does not exist
- **WHEN** a selected plant has no `plant_occurrences` row for the selected occurrence type with `status = 'open'`
- **THEN** the mutation RPC MUST NOT create a new `plant_occurrences` row for that plant and occurrence type.
- **THEN** the confirmed operation MUST continue for the remaining selected plants.

#### Scenario: Closed occurrence exists
- **WHEN** a selected plant has a matching occurrence with a status other than `open`
- **THEN** the mutation RPC MUST NOT change that closed occurrence as part of bulk removal.

### Requirement: Bulk occurrence action remains auditable
Every confirmed bulk occurrence add or remove action SHALL keep the polygon bulk operation audit trail.

#### Scenario: Occurrence add is confirmed
- **WHEN** the user confirms add mode with selected plants and occurrence types
- **THEN** the operation MUST write `field_operations`, `field_operation_areas`, and `plant_operation_history` according to the existing mass inclusion audit behavior.

#### Scenario: Occurrence remove is confirmed
- **WHEN** the user confirms remove mode with selected plants and occurrence types
- **THEN** the operation MUST write `field_operations`, `field_operation_areas`, and `plant_operation_history` according to the existing mass inclusion audit behavior.
- **THEN** the user-facing result MUST expose how many occurrence rows were resolved or updated.


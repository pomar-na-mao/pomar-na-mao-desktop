## ADDED Requirements

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

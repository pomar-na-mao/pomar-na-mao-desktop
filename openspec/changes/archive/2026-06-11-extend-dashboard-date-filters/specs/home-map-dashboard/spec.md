## ADDED Requirements

### Requirement: Dashboard period filter is optional and server-backed
The `home` dashboard SHALL treat `Período` as an optional server-backed filter instead of a local-only UI state.

#### Scenario: Home dashboard opens without a period filter
- **WHEN** the user opens the `home` dashboard with no `Período` boundary selected
- **THEN** the system MUST load the dashboard snapshot without applying a temporal restriction
- **THEN** the map MUST keep showing the full unfiltered plant set allowed by the other active filters

#### Scenario: User applies a period range with an operation selected
- **WHEN** the user selects an operation and informs at least one `Período` boundary
- **THEN** the system MUST refetch the dashboard snapshot using the selected operation and date boundaries
- **THEN** the map MUST display only plants matched by that operation inside the informed period

#### Scenario: User changes the period without selecting an operation
- **WHEN** the user informs a `Período` boundary while no operation is selected
- **THEN** the system MUST NOT interpret the period against an undefined event source
- **THEN** the dashboard MUST keep the unfiltered snapshot for temporal criteria until an operation is chosen

### Requirement: Dashboard supports planting date range filtering
The `home` dashboard SHALL support an independent date range filter based on `plants.planting_date`.

#### Scenario: User applies a planting date interval
- **WHEN** the user informs a start date, an end date, or both for `Data de plantio`
- **THEN** the system MUST refetch the dashboard snapshot with the informed planting date boundaries
- **THEN** the map MUST display only plants whose `planting_date` falls inside the requested interval

#### Scenario: Plant has no planting date while planting filter is active
- **WHEN** a plant has `planting_date` equal to `null` and the user has an active `Data de plantio` filter
- **THEN** the plant MUST be excluded from the returned dashboard snapshot

### Requirement: Dashboard date filters can be combined
The `home` dashboard SHALL compose `Período` and `Data de plantio` filters in the same snapshot request.

#### Scenario: User applies both date filters
- **WHEN** the user selects an operation, informs a `Período` boundary, and also informs `Data de plantio`
- **THEN** the system MUST request a snapshot that applies both temporal criteria together
- **THEN** the map MUST display only plants that satisfy the operation period filter and the planting date filter at the same time

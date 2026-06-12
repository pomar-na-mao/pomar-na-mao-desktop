## Requirements

### Requirement: Home layout is centered on the map
The `home` screen SHALL render a layout with the map as the central element, four vertical cards on the left side of the map, and four vertical cards on the right side of the map.

#### Scenario: Home screen is opened
- **WHEN** the user navigates to the `home` route
- **THEN** the screen MUST show a central map area
- **THEN** the screen MUST show four stacked cards on the left of the map
- **THEN** the screen MUST show four stacked cards on the right of the map

### Requirement: Left-side cards load operational totals on initialization
The `home` screen SHALL load and display, during initial component load, the total counts of `plants`, `zones`, `occurrence_types`, and `varieties`.

#### Scenario: Initial home data load succeeds
- **WHEN** the `home` component initializes
- **THEN** the first left-side card MUST display the total number of records from `plants`
- **THEN** the second left-side card MUST display the total number of records from `zones`
- **THEN** the third left-side card MUST display the total number of records from `occurrence_types`
- **THEN** the fourth left-side card MUST display the total number of records from `varieties`

### Requirement: Map starts with all plants plotted
The `home` screen SHALL plot all available plants on the map as part of the initial load, without requiring the user to apply a filter first.

#### Scenario: Home map data is loaded
- **WHEN** the `home` component finishes its initial data fetch
- **THEN** the map MUST render markers for all returned plants that have valid coordinates

### Requirement: Plants are colored by variety and legend is visible
The `home` screen SHALL assign marker colors by plant variety and SHALL display a corresponding variety legend inside the varieties card.

#### Scenario: Plants and varieties are available
- **WHEN** the `home` screen receives plants and variety metadata
- **THEN** each plant marker MUST be colored according to its variety
- **THEN** the varieties card MUST show a legend entry for each displayed variety color mapping

### Requirement: Right-side cards are rendered with mock values
The `home` screen SHALL display four right-side cards with fixed labels and mock numeric values until real logic is implemented.

#### Scenario: Home screen is opened
- **WHEN** the `home` route is rendered
- **THEN** the first right-side card MUST show `Pulverizacoes` with value `1`
- **THEN** the second right-side card MUST show `Anotacoes` with value `28`
- **THEN** the third right-side card MUST show `Inspecoes` with value `20`
- **THEN** the fourth right-side card MUST show `Colheita` with value `1`

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

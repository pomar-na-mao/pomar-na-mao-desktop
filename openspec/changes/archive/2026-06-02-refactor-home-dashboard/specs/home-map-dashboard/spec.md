## ADDED Requirements

### Requirement: Home layout is centered on the map
The system SHALL render a layout with the map as the central element, four vertical cards on the left side of the map, and four vertical cards on the right side of the map.

#### Scenario: Home screen is opened
- **WHEN** the user navigates to the home route
- **THEN** the screen MUST show a central map area
- **THEN** the screen MUST show four stacked cards on the left of the map
- **THEN** the screen MUST show four stacked cards on the right of the map

### Requirement: Left-side cards load operational totals on initialization
The system SHALL load and display, during initial component load, the total counts of plants, zones, occurrence_types, and varieties from the database.

#### Scenario: Initial home data load succeeds
- **WHEN** the home component initializes
- **THEN** the first left-side card MUST display the total number of records from plants
- **THEN** the second left-side card MUST display the total number of records from zones
- **THEN** the third left-side card MUST display the total number of records from occurrence_types
- **THEN** the fourth left-side card MUST display the total number of records from varieties

### Requirement: Map starts with all plants plotted
The system SHALL plot all available plants on the map as part of the initial load, without requiring the user to apply a filter first.

#### Scenario: Home map data is loaded
- **WHEN** the home component finishes its initial data fetch
- **THEN** the map MUST render markers for all returned plants that have valid coordinates

### Requirement: Plants are colored by variety and legend is visible
The system SHALL assign marker colors by plant variety and SHALL display a corresponding variety legend inside the varieties card.

#### Scenario: Plants and varieties are available
- **WHEN** the home screen receives plants and variety metadata
- **THEN** each plant marker MUST be colored according to its variety
- **THEN** the varieties card MUST show a legend entry for each displayed variety color mapping

### Requirement: Right-side cards are rendered with mock values
The system SHALL display four right-side cards with fixed labels and mock numeric values.

#### Scenario: Home screen is opened
- **WHEN** the home route is rendered
- **THEN** the first right-side card MUST show "Pulverizações" with value 1
- **THEN** the second right-side card MUST show "Anotações" with value 28
- **THEN** the third right-side card MUST show "Inspeções" with value 20
- **THEN** the fourth right-side card MUST show "Colheita" with value 1

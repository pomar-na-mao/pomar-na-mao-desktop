## ADDED Requirements

### Requirement: Selected zone polygon uses collected point order
The home dashboard SHALL plot a selected zone polygon from region points sorted by their collected order.

#### Scenario: User selects a zone with ordered region points
- **WHEN** the user selects a zone that has at least three region points with valid latitude, longitude, and order values
- **THEN** the map MUST render the zone polygon by connecting the points in ascending order value
- **THEN** the rendered polygon MUST close the outline after the final ordered point

#### Scenario: User selects a zone with unordered response data
- **WHEN** the dashboard receives region points for a selected zone in any response order
- **THEN** the rendered zone polygon MUST still follow ascending order value rather than response position

#### Scenario: Selected zone cannot form a polygon
- **WHEN** the selected zone has fewer than three valid ordered points
- **THEN** the map MUST NOT render an invalid zone polygon for that selection

### Requirement: Farm polygon is plotted on initial load
The home dashboard SHALL plot the farm boundary on the map when the screen opens.

#### Scenario: Home dashboard opens with farm points available
- **WHEN** the user opens `/inicio` and the farm boundary has at least three points with valid latitude, longitude, and order values
- **THEN** the map MUST render the farm polygon by connecting the points in ascending order value
- **THEN** the farm polygon MUST be visible without requiring any zone selection

#### Scenario: Farm boundary response is unordered
- **WHEN** the dashboard receives farm boundary points in any response order
- **THEN** the rendered farm polygon MUST follow ascending order value rather than response position

#### Scenario: Farm boundary cannot form a polygon
- **WHEN** the farm boundary has fewer than three valid ordered points
- **THEN** the dashboard MUST continue rendering the map and plant markers
- **THEN** the map MUST NOT render an invalid farm polygon

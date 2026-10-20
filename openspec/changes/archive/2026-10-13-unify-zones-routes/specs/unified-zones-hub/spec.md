## Purpose

Provides a unified hub at /zonas to seamlessly navigate between zone polygon management and zone plant assignment using an accessible horizontal navigation bar.

## ADDED Requirements

### Requirement: Unified zone view displays an accessible horizontal navigation bar
The `/zonas` screen SHALL render a top horizontal tab bar allowing users to switch between zone polygon management and zone assignment workflows.

#### Scenario: User views the zones screen
- **WHEN** the user navigates to `/zonas`
- **THEN** the screen MUST render a horizontal navigation bar containing tabs for "Cadastro de Zonas" and "Atribuição de Zonas".
- **THEN** the navigation bar MUST have semantic accessibility attributes including `role="tablist"` and `role="tab"`.
- **THEN** interactive tab buttons MUST have an accessible touch target of at least 44px in height.
- **THEN** the active tab MUST be visibly highlighted with primary theme colors and have `aria-selected="true"`.

### Requirement: Seamless switching between zone workflows
The system SHALL switch the active content between Zone Polygon Management and Zone Assignment without requiring a full page reload or separate route navigation.

#### Scenario: User switches to Zone Assignment tab
- **WHEN** the user clicks on the "Atribuição de Zonas" tab
- **THEN** the screen MUST display the zone plant assignment form and polygon selector map.
- **THEN** the zone polygon management content MUST be hidden.
- **THEN** the map layout MUST invalidate its size to properly fill the available view area.

#### Scenario: User switches to Cadastro de Zonas tab
- **WHEN** the user clicks on the "Cadastro de Zonas" tab
- **THEN** the screen MUST display the zone creation/editing form and zone map polygons.
- **THEN** the zone assignment content MUST be hidden.
- **THEN** the map layout MUST invalidate its size to properly fill the available view area.

### Requirement: Active tab synchronization with URL query parameters
The `/zonas` view SHALL support URL query parameters to determine the initial active tab and reflect tab changes in the URL.

#### Scenario: User opens /zonas with tab query parameter
- **WHEN** the user accesses `/zonas?aba=atribuicao`
- **THEN** the active tab MUST initialize as "Atribuição de Zonas".

#### Scenario: User opens /zonas without query parameters
- **WHEN** the user accesses `/zonas` without query parameters
- **THEN** the active tab MUST default to "Cadastro de Zonas" (ou `cadastro`).

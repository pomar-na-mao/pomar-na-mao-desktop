# Zone Workflows Specification

## Purpose
Separates zone registration from zoning while preserving both workflows as independent navigation destinations.

## Requirements

### Requirement: Zone registration belongs to Cadastro
The zone polygon management screen SHALL be available from the `Cadastro` submenu.

#### Scenario: User opens zone registration
- **WHEN** the user navigates to `/cadastro/zonas`
- **THEN** the system MUST display the existing zone creation and editing content
- **THEN** the `Zonas` entry MUST appear below `Ocorrências` in the `Cadastro` submenu
- **THEN** the entry MUST use the `pi-map` icon.

### Requirement: Zoning is a top-level workflow
The existing zone assignment implementation SHALL be presented as `Zoneamento` without renaming its internal `zone-assignment` components, folders, or classes.

#### Scenario: User opens zoning
- **WHEN** the user navigates to `/zoneamento`
- **THEN** the system MUST display the zone plant assignment form and polygon selector map
- **THEN** the screen title MUST be `Zoneamento`.

#### Scenario: Sidebar is rendered
- **WHEN** the authenticated sidebar is displayed
- **THEN** `Zoneamento` MUST be a top-level item without child routes
- **THEN** the item MUST use the `pi-share-alt` icon
- **THEN** no top-level `Zonas` item MUST be displayed.

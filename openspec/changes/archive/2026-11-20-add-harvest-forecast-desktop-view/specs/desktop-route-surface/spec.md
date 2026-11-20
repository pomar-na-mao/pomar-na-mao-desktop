## ADDED Requirements

### Requirement: Harvest forecast route is available from the main menu
The desktop app SHALL expose the authenticated harvest forecast screen at `/previsao-de-safra` and SHALL provide exactly one top-level menu entry labelled `Previsão de Safra` immediately below the `Mipd` group.

#### Scenario: Authenticated user navigates to harvest forecast
- **WHEN** the router matches `/previsao-de-safra`
- **THEN** the harvest forecast screen MUST be loaded lazily inside the authenticated main layout.

#### Scenario: Sidebar menu is rendered
- **WHEN** the authenticated layout sidebar is displayed
- **THEN** exactly one top-level entry labelled `Previsão de Safra` MUST appear immediately after `Mipd`
- **AND** the entry MUST navigate to `/previsao-de-safra` and use an icon consistent with the existing PrimeIcons menu system.


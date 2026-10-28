# desktop-route-surface Specification

## Purpose
TBD - created by archiving change cleanup-desktop-routes. Update Purpose after archive.

## Requirements

### Requirement: Public authentication route remains available
The desktop app SHALL keep the `login` route available outside the authenticated main layout.

#### Scenario: User accesses login route
- **WHEN** the router matches `/login`
- **THEN** the login screen MUST be loaded without requiring the authenticated layout child route list.

### Requirement: Authenticated route surface is limited
The desktop app SHALL expose `visao-geral`, `cadastro`, `atividades-de-campo`, `inicio`, `visao-das-operacoes`, `dados-basicos`, `zoneamento`, `configuracoes`, and `usuarios` as active authenticated child routes, while redirecting legacy `/inicio` to `/visao-geral` and `/atribuicao-zonas` to `/zoneamento`.

#### Scenario: Main layout child routes are evaluated
- **WHEN** the authenticated main layout route is configured
- **THEN** the child route paths MUST include `visao-geral`, `cadastro`, `atividades-de-campo`, `inicio`, `visao-das-operacoes`, `dados-basicos`, `zoneamento`, `configuracoes`, and `usuarios`.
- **THEN** `/visao-das-operacoes` MUST provide only the `operacoes` and `mipd` child screens and MUST redirect its empty path to `operacoes`.
- **THEN** navigating to `/inicio` MUST redirect to `/visao-geral`.
- **THEN** navigating to `/atribuicao-zonas` MUST redirect to `/zoneamento`.
- **THEN** the child route paths MUST NOT include `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, or `reports`.

### Requirement: Unsupported route code is removed
The desktop app SHALL remove files, components, view-models, services, repositories, and tests that exist only to support the removed route screens.

#### Scenario: Source references are checked after cleanup
- **WHEN** the codebase is searched for removed route paths and route-exclusive symbols
- **THEN** no retained source file MUST import or navigate to `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, or `reports`.

### Requirement: Retained screens keep their dependencies
The desktop app SHALL preserve files required by the retained `overview`, `orchard`, `basic-data`, `settings`, `users`, and `login` screens.

#### Scenario: Project validation runs after cleanup
- **WHEN** TypeScript, lint, and automated tests are run
- **THEN** validation MUST complete without failures caused by stale imports, missing route dependencies, or deleted retained-screen dependencies.

### Requirement: Navigation menu matches retained routes
The desktop app SHALL show `Visão geral` as the first navigation entry, followed by the `Cadastro` group and the remaining retained routes, without a duplicate zone assignment entry.

#### Scenario: Sidebar menu is rendered
- **WHEN** the authenticated layout sidebar is displayed
- **THEN** the first menu item MUST be labelled `Visão geral` and point to `/visao-geral`.
- **THEN** the `Cadastro` submenu MUST use the `pi-file-import` icon
- **THEN** the submenu MUST provide `/cadastro/variedades`, `/cadastro/ocorrencias`, `/cadastro/zonas`, `/cadastro/infraestrutura`, `/cadastro/maquinas`, and `/cadastro/insumos` in that order
- **THEN** the `/cadastro/zonas` entry MUST use the `pi-map` icon
- **THEN** a `Atividades de campo` entry MUST appear immediately below `Cadastro` and provide `/atividades-de-campo`.
- **THEN** the menu MUST provide navigation to `dados-basicos`, `zoneamento`, `configuracoes`, and `usuarios`.
- **THEN** one submenu labelled `Visão das operações` MUST use the `pi-hammer` icon.
- **THEN** the submenu MUST provide `/visao-das-operacoes/operacoes` and `/visao-das-operacoes/mipd` in that order.
- **THEN** the sidebar MUST NOT expose `/operacoes` or `/mipd` as top-level entries.
- **THEN** exactly one top-level entry labelled `Zoneamento` pointing to `/zoneamento` MUST appear immediately below `Dados básicos`.
- **THEN** the `Zoneamento` entry MUST use the `pi-share-alt` icon and MUST NOT contain child routes.
- **THEN** the sidebar menu MUST NOT include an entry labelled `Zonas` or `Atribuição de Zonas`.

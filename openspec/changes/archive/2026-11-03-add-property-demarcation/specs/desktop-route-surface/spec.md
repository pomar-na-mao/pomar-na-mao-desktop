## ADDED Requirements

### Requirement: Property demarcation route is available under registration
The desktop app SHALL expose the authenticated property demarcation screen at `/cadastro/propriedade`.

#### Scenario: Authenticated user navigates to property demarcation
- **WHEN** the router matches `/cadastro/propriedade`
- **THEN** the property demarcation screen MUST be loaded within the authenticated main layout and Cadastro container.

## MODIFIED Requirements

### Requirement: Navigation menu matches retained routes
The desktop app SHALL show `Visão geral` as the first navigation entry, followed by the `Cadastro` group and the remaining retained routes, without a duplicate zone assignment entry.

#### Scenario: Sidebar menu is rendered
- **WHEN** the authenticated layout sidebar is displayed
- **THEN** the first menu item MUST be labelled `Visão geral` and point to `/visao-geral`.
- **THEN** the `Cadastro` submenu MUST use the `pi-file-import` icon.
- **THEN** the submenu MUST provide `/cadastro/propriedade`, `/cadastro/variedades`, `/cadastro/ocorrencias`, `/cadastro/zonas`, `/cadastro/insumos`, `/cadastro/caldas`, and `/cadastro/maquinas` in that order.
- **THEN** the `/cadastro/propriedade` entry MUST be labelled `Demarcação propriedade` and use a map-related icon.
- **THEN** the `/cadastro/zonas` entry MUST use the `pi-map` icon.
- **THEN** an `Atividades de campo` entry MUST appear immediately below `Cadastro` and provide `/atividades-de-campo`.
- **THEN** the menu MUST provide navigation to `dados-basicos`, `zoneamento`, `configuracoes`, and `usuarios`.
- **THEN** one submenu labelled `Visão das operações` MUST use the `pi-hammer` icon.
- **THEN** the submenu MUST provide `/visao-das-operacoes/operacoes` and `/visao-das-operacoes/mipd` in that order.
- **THEN** the sidebar MUST NOT expose `/operacoes` or `/mipd` as top-level entries.
- **THEN** exactly one top-level entry labelled `Zoneamento` pointing to `/zoneamento` MUST appear immediately below `Dados básicos`.
- **THEN** the `Zoneamento` entry MUST use the `pi-share-alt` icon and MUST NOT contain child routes.
- **THEN** the sidebar menu MUST NOT include an entry labelled `Zonas` or `Atribuição de Zonas`.

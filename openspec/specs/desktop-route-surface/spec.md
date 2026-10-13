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
The desktop app SHALL expose `inicio`, `operacoes`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios` as active authenticated child routes, while redirecting legacy `/atribuicao-zonas` to `/zonas`.

#### Scenario: Main layout child routes are evaluated
- **WHEN** the authenticated main layout route is configured
- **THEN** the child route paths MUST include `inicio`, `operacoes`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios`.
- **THEN** navigating to `/atribuicao-zonas` MUST redirect to `/zonas`.
- **THEN** the child route paths MUST NOT include `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, or `reports`.

### Requirement: Unsupported route code is removed
The desktop app SHALL remove files, components, view-models, services, repositories, and tests that exist only to support the removed route screens.

#### Scenario: Source references are checked after cleanup
- **WHEN** the codebase is searched for removed route paths and route-exclusive symbols
- **THEN** no retained source file MUST import or navigate to `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, or `reports`.

### Requirement: Retained screens keep their dependencies
The desktop app SHALL preserve files required by the retained `home`, `inclusoes-em-massa`, `settings`, `users`, and `login` screens.

#### Scenario: Project validation runs after cleanup
- **WHEN** TypeScript, lint, and automated tests are run
- **THEN** validation MUST complete without failures caused by stale imports, missing route dependencies, or deleted retained-screen dependencies.

### Requirement: Navigation menu matches retained routes
The desktop app SHALL show navigation entries for `inicio`, `operacoes`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios` without a duplicate zone assignment entry.

#### Scenario: Sidebar menu is rendered
- **WHEN** the authenticated layout sidebar is displayed
- **THEN** the menu MUST provide navigation to `inicio`, `operacoes`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios`.
- **THEN** exactly one entry for `Zonas` pointing to `/zonas` MUST appear in the sidebar immediately below `Inclusões em Massa`.
- **THEN** the sidebar menu MUST NOT include a separate entry for `Atribuição de Zonas`.

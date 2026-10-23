## MODIFIED Requirements

### Requirement: Authenticated route surface is limited
The desktop app SHALL expose `inicio`, `operacoes`, `mipd`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios` as active authenticated child routes, while redirecting legacy `/atribuicao-zonas` to `/zonas`.

#### Scenario: Main layout child routes are evaluated
- **WHEN** the authenticated main layout route is configured
- **THEN** the child route paths MUST include `inicio`, `operacoes`, `mipd`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios`.
- **THEN** navigating to `/atribuicao-zonas` MUST redirect to `/zonas`.
- **THEN** the child route paths MUST NOT include `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, or `reports`.

### Requirement: Navigation menu matches retained routes
The desktop app SHALL show navigation entries for `inicio`, `operacoes`, `mipd`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios` without a duplicate zone assignment entry.

#### Scenario: Sidebar menu is rendered
- **WHEN** the authenticated layout sidebar is displayed
- **THEN** the menu MUST provide navigation to `inicio`, `operacoes`, `mipd`, `inclusoes-em-massa`, `zonas`, `configuracoes`, and `usuarios`.
- **THEN** exactly one entry labelled `Mipd` pointing to `/mipd` MUST appear immediately below `Operações`.
- **THEN** exactly one entry for `Zonas` pointing to `/zonas` MUST appear in the sidebar immediately below `Inclusões em Massa`.
- **THEN** the sidebar menu MUST NOT include a separate entry for `Atribuição de Zonas`.


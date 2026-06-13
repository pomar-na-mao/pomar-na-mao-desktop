## MODIFIED Requirements

### Requirement: Authenticated route surface is limited
The desktop app SHALL expose `home`, `operations`, `inclusoes-em-massa`, `settings`, and `users` as child routes under the authenticated `path: ''` main layout.

#### Scenario: Main layout child routes are evaluated
- **WHEN** the authenticated main layout route is configured
- **THEN** the child route paths MUST include `home`, `operations`, `inclusoes-em-massa`, `settings`, and `users`.
- **THEN** the child route paths MUST NOT include `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, or `reports`.

### Requirement: Navigation menu matches retained routes
The desktop app SHALL show navigation entries for `home`, `operations`, `inclusoes-em-massa`, `settings`, and `users`.

#### Scenario: Sidebar menu is rendered
- **WHEN** the authenticated layout sidebar is displayed
- **THEN** the menu MUST provide navigation to retained authenticated routes and the new `operations` route.
- **THEN** the menu MUST NOT include entries for `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, or `reports`.

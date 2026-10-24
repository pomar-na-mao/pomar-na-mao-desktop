# Development Placeholder Views Specification

## Purpose
Exposes planned registration and field notebook destinations before their complete workflows are implemented.

## Requirements

### Requirement: Registration placeholders are available
The `Cadastro` submenu SHALL expose placeholder screens for infrastructure, machines, and inputs.

#### Scenario: User opens a planned registration screen
- **WHEN** the user navigates to `/cadastro/infraestrutura`, `/cadastro/maquinas`, or `/cadastro/insumos`
- **THEN** the corresponding view component MUST render `Em desenvolvimento`.

### Requirement: Field notebook exposes completed operations
The sidebar SHALL expose `Caderno de campo` immediately below `Cadastro` with one child route.

#### Scenario: User opens completed operations
- **WHEN** the user navigates to `/caderno-de-campo/operacoes-realizadas`
- **THEN** the corresponding view component MUST render `Em desenvolvimento`.

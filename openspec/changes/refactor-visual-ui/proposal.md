## Why

The Angular desktop UI already uses Tailwind and supports light/dark themes, but its visual rules are distributed across long utility strings, duplicated native controls, and screen-specific button/card patterns. A shared compact design system is needed to increase information density, consistency, accessibility, and responsive behavior without changing any application workflow or data behavior.

## What Changes

- Introduce semantic visual tokens for pastel light/dark colors, compact typography, spacing, radii, elevation, glow, focus, and motion.
- Configure Tailwind 4 to expose the semantic tokens while keeping CSS custom properties as the runtime theme source of truth.
- Standardize reusable compact input, select/dropdown, and textarea styling, including default, hover, focus-visible, disabled, read-only, and validation-error states.
- Introduce one reusable button API with `primary`, `secondary`, `warning`, `info`, and `danger` variants plus `sm` and `md` sizes and complete interaction states.
- Refactor the authenticated shell, login, dashboard, operations, mass inclusion, zones, settings, users, maps, forms, cards, tables, alerts, tabs, and menus to consume the shared visual system.
- Define responsive behavior for mobile, tablet, desktop, map-plus-panel layouts, tables, navigation, overlays, and pinned action areas.
- Standardize hover/focus feedback and motion while honoring `prefers-reduced-motion`.
- Preserve component logic, services, routes, form models and validators, API calls, events, bindings, control names, and user-visible workflows.
- Add or update unit and component-level tests that assert preserved bindings, states, accessibility semantics, and responsive CSS contracts; no database or Supabase change is included.

## Capabilities

### New Capabilities

- `application-visual-system`: Defines the semantic design tokens, reusable buttons and surfaces, light/dark presentation, interaction feedback, accessibility, and responsive behavior shared across the application.

### Modified Capabilities

- `ui-input-select-mass-inclusion-style`: Replaces the existing spacious, mass-inclusion-oriented form-control requirements with compact global input, select/dropdown, and textarea requirements that apply consistently to every screen.

## Impact

- Primary files: `src/styles.css`, a Tailwind 4 configuration bridge if retained after implementation validation, shared form controls under `src/app/shared/components/`, and a new shared button component or directive/class API.
- UI migration surface: templates and inline templates under `src/app/ui/`, especially the application shell, login, dashboard/operations filters and maps, mass inclusion, zone management/assignment, settings, and users.
- Tests: existing Angular/Vitest specs plus focused shared-control/button and responsive/accessibility regression coverage.
- Dependencies and systems: no required runtime dependency, route, service, data model, Supabase schema, RPC, API, or persistence change.


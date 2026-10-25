# application-visual-system Specification

## Purpose

Defines a compact, accessible, theme-aware visual language and responsive presentation contract shared by every user-facing screen in the desktop application.

## Requirements

### Requirement: Semantic visual tokens are consistent across themes
The application SHALL use one semantic token set for canvas, surfaces, text, borders, actions, status colors, radii, spacing, shadows, glows, and motion in light and dark themes.

#### Scenario: Light theme is displayed
- **WHEN** the application renders with the light theme active
- **THEN** every migrated screen MUST use the light semantic tokens instead of screen-specific hard-coded neutral and action colors
- **THEN** normal text and interactive controls MUST meet WCAG AA contrast against their rendered backgrounds

#### Scenario: Dark theme is displayed
- **WHEN** the application renders with the dark theme active
- **THEN** the same semantic roles MUST resolve to the dark token values without changing component structure or behavior
- **THEN** borders, muted text, overlays, focus indicators, and disabled states MUST remain distinguishable

### Requirement: Compact typography preserves hierarchy and legibility
The application SHALL use a reduced typographic scale that increases information density while preserving a clear hierarchy and readable line height.

#### Scenario: Dense application content is rendered
- **WHEN** forms, filters, cards, tables, menus, or map overlays are displayed
- **THEN** body copy, labels, metadata, headings, and page titles MUST use the corresponding shared typography roles
- **THEN** text below 11px MUST NOT be used for functional information
- **THEN** truncation MUST expose the full value through an accessible label, title, or equivalent mechanism when the value is necessary to complete a task

### Requirement: Global button API exposes semantic variants and sizes
Every migrated native button SHALL consume one shared visual button API with `primary`, `secondary`, `warning`, `info`, and `danger` variants and `sm` and `md` sizes.

#### Scenario: Button interaction states are exercised
- **WHEN** a button is in its default, hover, focus-visible, active, or disabled state
- **THEN** its variant MUST provide a consistent color, border, elevation, cursor, and focus treatment in both themes
- **THEN** hover and active feedback MUST NOT cause surrounding layout to shift
- **THEN** a disabled button MUST be visually distinct and non-interactive

#### Scenario: Icon-only button is displayed
- **WHEN** a button has no visible text label
- **THEN** it MUST have an accessible name
- **THEN** its interactive target MUST remain at least 44px on touch-oriented narrow layouts while its visible icon MAY remain compact

### Requirement: Shared surfaces use standardized elevation and feedback
Cards, map overlays, menus, tabs, table rows, alerts, and navigation items SHALL use shared surface, border, shadow, glow, and interaction tokens.

#### Scenario: Interactive surface receives pointer or keyboard interaction
- **WHEN** the user hovers an interactive surface or focuses it with the keyboard
- **THEN** the surface MUST provide visible feedback using color, border, shadow, or glow without relying only on movement
- **THEN** keyboard focus MUST be visible in both themes

#### Scenario: Status information is displayed
- **WHEN** success, information, warning, or danger status is shown
- **THEN** color MUST be paired with text, an icon, or another non-color cue
- **THEN** the status foreground and background combination MUST meet WCAG AA contrast for its text size

### Requirement: Application layouts adapt across supported viewport classes
All active screens SHALL remain usable at 320px, 768px, 1024px, and 1440px viewport widths without unintended horizontal page scrolling or hidden primary actions.

#### Scenario: Authenticated shell is displayed on a narrow viewport
- **WHEN** the viewport is narrower than the desktop navigation breakpoint
- **THEN** the persistent sidebar MUST be replaced by an accessible dismissible navigation drawer or equivalent compact navigation
- **THEN** the main content MUST use the full available width and remain clear of the fixed header

#### Scenario: Map and filter workflow is displayed on a narrow viewport
- **WHEN** overview, operations, basic data, zone management, or zone assignment is displayed on a narrow viewport
- **THEN** the filter or form panel MUST become a collapsible sheet, drawer, or bounded top panel
- **THEN** the map MUST retain a usable minimum height and its controls MUST remain reachable without overlapping primary actions

#### Scenario: Users table is displayed on a narrow viewport
- **WHEN** the users screen is displayed below the tablet breakpoint
- **THEN** the data MUST be presented as accessible stacked rows/cards or within an explicitly scrollable table region
- **THEN** identity, role, status, and management actions MUST remain available

#### Scenario: Settings and login are displayed responsively
- **WHEN** the settings or login screen is displayed at any supported viewport width
- **THEN** forms, tabs, action groups, and decorative content MUST reflow without clipping or forcing horizontal page scroll
- **THEN** existing fields, tabs, messages, and actions MUST remain present

### Requirement: Motion is consistent and respects user preference
Visual transitions SHALL use shared duration and easing tokens and SHALL respect the user's reduced-motion preference.

#### Scenario: Standard motion is allowed
- **WHEN** the operating system does not request reduced motion
- **THEN** hover, focus, menu, card, row, and theme transitions MUST use the shared fast or standard motion tokens

#### Scenario: Reduced motion is requested
- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** non-essential transitions, transforms, pulses, bounces, and entrance animations MUST be removed or reduced to an effectively immediate state change
- **THEN** loading indicators MAY continue animating only when necessary to communicate ongoing activity

### Requirement: Visual refactoring preserves functional contracts
The visual refactoring SHALL preserve all existing application logic and user workflows.

#### Scenario: A migrated screen is compared with its baseline behavior
- **WHEN** its forms, filters, tabs, maps, menus, buttons, and messages are exercised before and after migration
- **THEN** routes, service calls, form controls, validators, bindings, emitted events, API requests, and state transitions MUST remain equivalent
- **THEN** no Supabase schema, RPC, policy, permission, or persistence contract MUST change

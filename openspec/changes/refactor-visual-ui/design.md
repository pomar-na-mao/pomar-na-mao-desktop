## Context

See `proposal.md` for motivation and scope. The current UI is an Angular 22 standalone-component application packaged with Tauri and styled with Tailwind CSS 4.1 through `@tailwindcss/postcss`.

### Current UI diagnosis

- `src/styles.css` imports Tailwind and Leaflet, defines the class-based dark variant, native select chevron, region label, and scrollbar styles. There is no `tailwind.config.*`; styling is effectively CSS-first plus utilities.
- Theme state is controlled in the header by adding `.dark` to `<html>`, initialized from `localStorage` or `prefers-color-scheme`. Individual templates repeat `dark:*` utilities extensively.
- Poppins is loaded from Google Fonts in `src/index.html` and applied through a body utility. It is already a strong compact UI font, so changing family would add risk without a clear readability gain.
- Shared ControlValueAccessor components already exist for `app-input`, `app-select`, and `app-textarea`. They use similar `slate`/`emerald` styles but do not share semantic token classes or a size API. The select also owns a custom colored-option dropdown.
- Native inputs, textareas, checkboxes, and buttons still appear throughout mass inclusion, zone management/assignment, map toolbars, header, sidebar, settings, users, and operation detail overlays. Their repeated utility strings diverge in height, padding, radius, focus treatment, disabled treatment, and active transform.
- There is no global button abstraction. Primary actions range from `py-2` to `py-4`, radii range from `rounded-lg` to `rounded-2xl`, and color intent is encoded directly as emerald, blue, amber, red, or slate utilities.
- Page typography ranges from 9px metadata to 30px page titles. Many labels/body lines are 14px even inside dense side panels, while 9–10px functional metadata can become difficult to read.
- The authenticated shell uses a fixed 60px header and a 64/240px desktop sidebar. Below `md`, the sidebar is hidden but no mobile navigation surface is provided.
- Dashboard and operations use a fixed 320px filter rail plus map and do not currently reflow the rail for narrow viewports. Mass inclusion and zone workflows have better mobile stacking but rely on a fixed 50vh panel and repeat nearly identical panel/map/fullscreen/toast styling.
- Login has a responsive 60/40 desktop split and mobile-only brand block. Settings uses scrollable tabs and a responsive profile grid. Users uses an overflow table, but its search wrapper has `min-w-[300px]`, creating risk near 320px, and it lacks a mobile row alternative.
- Map overlays and details cards use fixed widths/offsets and high z-index values. They need viewport-bounded widths, safe-area spacing, consistent focus rings, and collision rules for mobile.
- Existing tests mainly cover component/view-model behavior. Shared visual-state, button API, responsive contracts, reduced motion, and theme contrast need focused regression coverage.

## Goals / Non-Goals

**Goals:**

- Establish semantic tokens as the only source for application-level color, typography, spacing, radius, elevation, focus, and motion decisions.
- Provide small, composable visual APIs that preserve native semantics and existing Angular bindings.
- Migrate screen-by-screen with reviewable diffs and a behavior-preservation gate after each slice.
- Support 320px, 768px, 1024px, and 1440px reference widths in light and dark modes.
- Keep the visual density compact on desktop while maintaining touch targets on narrow layouts.

**Non-Goals:**

- No change to component business logic, signals, view-models, repositories, services, routes, guards, forms, validators, API calls, map data, or Supabase.
- No redesign of information architecture or addition/removal of user-facing actions.
- No replacement of Leaflet, Angular forms, or the Tailwind build pipeline.
- No new icon library in the first pass; existing inline SVGs remain, but their sizing and button containers are standardized.
- No functional completion of placeholder settings/users actions.

## Decisions

### 1. Use CSS custom properties as runtime tokens and Tailwind 4 theme variables as the utility API

`src/styles.css` will define semantic runtime variables under `:root` and `.dark`, then expose them through top-level `@theme inline` variables. This matches Tailwind 4's CSS-first model and lets theme switching update values without rebuilding classes.

A small `tailwind.config.js` will be explicitly loaded with `@config` only where legacy configuration adds value, such as shared content metadata or extensions that cannot be expressed cleanly as theme variables. Token values will not be duplicated there; CSS remains authoritative. Tailwind documents JavaScript configuration as a legacy bridge in v4 and states that CSS definitions take precedence when both are present.

Alternative considered: store the complete palette in JavaScript configuration. Rejected because it duplicates theme values, weakens runtime theme switching, and works against the project's existing Tailwind 4 setup.

### 2. Proposed semantic color tokens

The palette is muted rather than low-contrast. Soft backgrounds are paired with darker text in light mode and light foregrounds in dark mode. Exact combinations will be checked with automated contrast tooling before implementation is accepted.

| Role | Light | Dark | Intended use |
|---|---:|---:|---|
| `canvas` | `#F6F8F5` | `#101713` | App background |
| `surface` | `#FFFFFF` | `#18201B` | Cards, panels, menus |
| `surface-muted` | `#EDF2EE` | `#202A24` | Secondary panels, rows |
| `surface-raised` | `#FAFCFA` | `#263129` | Overlays, active items |
| `border` | `#D4DDD6` | `#3A473E` | Default border |
| `border-strong` | `#AEBBB1` | `#536158` | Hover/strong separation |
| `text` | `#1F2A23` | `#EDF3EE` | Primary text |
| `text-muted` | `#526058` | `#B5C1B8` | Secondary text |
| `text-subtle` | `#68766D` | `#93A198` | Metadata only |
| `primary` | `#3F765D` | `#7CB694` | Main actions/selection |
| `primary-strong` | `#315F4A` | `#9AC9AD` | Hover/strong emphasis |
| `secondary` | `#596A61` | `#AAB7AF` | Neutral actions |
| `info` | `#356B87` | `#8AB8CF` | Informational actions/states |
| `warning` | `#855F19` | `#D9B66D` | Caution actions/states |
| `danger` | `#9B4548` | `#DE9295` | Destructive/error actions |
| `focus` | `#367C60` | `#8BC6A4` | Focus border/ring |

Each action role also receives `*-soft`, `*-border`, and `on-*` tokens. Filled light-theme actions use white only where measured contrast is at least 4.5:1; dark-theme pastel actions use a dark `on-*` foreground where that produces stronger contrast.

### 3. Compact typography keeps Poppins and replaces ad-hoc sizes with roles

Poppins remains the primary family. The proposed roles are:

| Role | Size / line-height | Weight |
|---|---|---|
| `caption` | 11px / 16px | 500–600 |
| `label` | 12px / 18px | 500–600 |
| `body` | 13px / 20px | 400–500 |
| `body-strong` | 13px / 20px | 600 |
| `subtitle` | 14px / 20px | 600 |
| `section-title` | 16px / 22px | 650–700 |
| `page-title` | 24px / 30px | 700 |

Current 9px/10px functional labels move up to `caption`; current 14px repetitive controls move down to 12–13px. This creates density without making critical text smaller than 11px. Letter spacing is limited to short uppercase metadata.

### 4. Use a compact spacing, radius, elevation, and motion scale

- Spacing: 2, 4, 6, 8, 12, 16, 20, 24, and 32px; dense forms default to 12px vertical groups and 6px label gaps.
- Radius: 6px (`sm`), 8px (`md`), 12px (`lg`), and 16px (`xl`); controls use 8px, cards use 12px, major overlays use 16px.
- Light shadows: `xs` = `0 1px 2px rgb(31 42 35 / .06)`; `sm` = `0 4px 12px rgb(31 42 35 / .08)`; `md` = `0 12px 30px rgb(31 42 35 / .12)`.
- Dark shadows: same geometry with `rgb(0 0 0 / .22–.38)` plus a subtle inner border.
- Focus glow: `0 0 0 3px rgb(63 118 93 / .18)` light and `0 0 0 3px rgb(124 182 148 / .22)` dark.
- Transitions: 120ms fast and 180ms standard, `cubic-bezier(.2, 0, 0, 1)`. No generic `transition-all` after migration; properties are explicit.
- Reduced motion: a global media query disables non-essential duration, transform, pulse, bounce, and entrance animation while retaining necessary progress indication.

### 5. Preserve native button semantics with a presentation directive

Create a standalone `appButton` attribute directive that adds only semantic presentation classes/host attributes to an existing native `<button>` or compatible link. Inputs:

- `variant`: `primary | secondary | warning | info | danger`
- `size`: `sm | md`
- optional `iconOnly`: applies square dimensions while requiring an accessible name at call sites
- optional `block`: full-width layout

Example:

```html
<button
  appButton
  variant="danger"
  size="sm"
  type="button"
  [disabled]="isDeleting()"
  (click)="deleteItem()"
>
  Excluir
</button>
```

The directive does not own click handling, disabled state, loading state, content, or routing. Existing bindings stay on the native element. A pure `.ui-btn` class API remains available for exceptional non-Angular/Leaflet markup but uses the same tokens.

Alternative considered: replace every native button with a component wrapper. Rejected because projection and wrapper event semantics would increase regression risk for a visual-only change.

### 6. Extend existing shared form components rather than replace their CVA contracts

`app-input`, `app-select`, and `app-textarea` retain their selectors, ControlValueAccessor behavior, current inputs/outputs, form bindings, and validation timing. Add a presentation-only `size: 'sm' | 'md'` input and shared Poppinsnal classes:

- `.ui-field`, `.ui-field--sm`, `.ui-field--md`
- `.ui-field-label`, `.ui-field-help`, `.ui-field-error`
- `.ui-select-trigger`, `.ui-select-menu`, `.ui-select-option`

Examples:

```html
<app-input
  size="sm"
  label="Nome da zona"
  formControlName="name"
  [errors]="nameErrors"
/>

<app-select
  size="sm"
  label="Zona"
  [options]="zoneOptions"
  [ngModel]="selectedZone()"
  (ngModelChange)="selectedZone.set($event)"
/>
```

Native controls are migrated to these components when their current contract can be preserved exactly. Controls with specialized behavior remain native and consume `.ui-field` directly. Error styles include icon/text or `aria-describedby`, not color alone. The custom select keeps its colored markers and selection logic; only its presentation and keyboard/focus audit change.

### 7. Responsive plan by screen and component

| Surface | Mobile (320–767) | Tablet (768–1023) | Desktop (1024+) |
|---|---|---|---|
| Header/sidebar | 52–56px compact header; sidebar becomes modal drawer with backdrop, focus return, and close affordance | Collapsed 64px rail by default; expandable | 64/224px rail, persistent; content offset tokenized |
| Login | Single-column form, restrained logo, 16px edge padding, no decorative panel | Single column with wider card | Existing 60/40 split retained, typography/padding compacted |
| Dashboard/operations | Map-first layout; filters in a collapsible sheet/drawer; fullscreen and sheet controls avoid collision | 280px collapsible rail + map | 288–304px persistent rail + map |
| Operation details | Bottom sheet or viewport-bounded card (`inset-x-3`, max height with scroll) | Right overlay capped to available width/height | Right card, compact 320–352px width |
| Mass inclusion | Form as bounded top sheet or drawer; pinned actions wrap/stack; map min-height 320px | 340px panel + map | 360–380px panel + map |
| Zones hub | Tabs horizontally scroll with preserved 44px target; active tab always visible | Same tabs plus side-by-side workflow | Compact tabs and 360–400px workflow panel + map |
| Map toolbars | Icon-first controls, labels hidden only when accessible names remain; safe 44px targets | Mixed icon/text | Compact 36–40px controls |
| Settings | 16px page padding; tabs scroll; profile/actions stack; fields one column | Two-column fields when space allows | Existing max-width layout with reduced padding |
| Users | Header/actions stack; search loses fixed min-width; row cards or labeled stacked cells | Scrollable compact table | Full table with compact rows and sticky header if useful |
| Toasts/menus | `left/right: 12px`, viewport-bounded width, safe-area aware | Anchored with max width | Existing top-right/dropdown placement with tokenized z-index |

Map containers will use `min-h-0`, viewport units that account for the header, and a shared resize/invalidate trigger already exposed by the existing view-models. No map behavior changes are introduced.

### 8. Migrate in low-risk slices and keep binding diffs reviewable

Migration order is tokens first, primitives second, shell third, then screens from simpler to denser. Template edits will preserve every Angular binding and event expression verbatim wherever possible. Component imports in external HTML templates use self-closing syntax when they have no projected content, following repository rules.

### 9. Verification strategy

- Static diff audit: compare `()`, `[]`, `[(...)]`, `formControlName`, `formGroup`, `routerLink`, and component selectors before/after each migrated template.
- Automated: `npm run lint`, `npm test`, and `npm run web:build`; add unit tests for button host classes, shared control sizes/states/CVA behavior, theme persistence, drawer state, and critical responsive semantics.
- Visual: capture light/dark baselines at 320, 768, 1024, and 1440px for every route and key state; compare focus, hover, disabled, invalid, loading, dropdown-open, toast, map fullscreen, and long-content states.
- Accessibility: keyboard-only traversal, visible focus, accessible names for icon buttons, label/control association, dropdown roles/state, zoom to 200%, reduced motion, and automated contrast checks for every token pair.
- Functional smoke: login, theme toggle, sidebar navigation, all filters, map fullscreen, polygon drawing, mass inclusion preview/save path, zone create/assign path, settings tabs, and users table actions (where currently functional).

## Risks / Trade-offs

- [Token migration leaves mixed legacy colors] → Add a temporary inventory check for raw `slate|emerald|blue|amber|red|rose` utilities in migrated files and remove it only after the final screen pass.
- [Compact controls reduce touch usability] → Keep 36/40px visual sizes on poPoppins layouts but enforce 44px targets on narrow/touch layouts and icon-only actions.
- [Button directive changes specificity or host classes] → Keep it presentation-only, test every variant/state, and migrate screen by screen.
- [Custom select accessibility regresses] → Preserve its value contract, add keyboard/focus tests, and verify listbox/option state before visual migration is accepted.
- [Tailwind 4 legacy config and CSS tokens diverge] → Keep values only in CSS and use `@config` as a bridge; CSS `@theme inline` wins on conflicts.
- [Map panels/overlays obscure controls on mobile] → Define shared safe-area offsets, bounded sheets, collision test cases, and explicit z-index layers.
- [Changing global typography causes clipping] → Migrate roles incrementally, test Portuguese strings and long data, and avoid hiding required content behind fixed heights.
- [Large template churn masks functional changes] → Separate token/primitives commits from screen migrations and use binding audits plus existing tests after each slice.
- [External Google Font is unavailable offline] → Keep the existing Poppins request but strengthen the system sans-serif fallback; a bundled font can be considered separately.

## Migration Plan

1. Record visual and binding baselines; introduce tokens, Tailwind 4 bridge, and reduced-motion rules without migrating screens.
2. Add/test the button directive and compact shared control styles while preserving CVA and native semantics.
3. Migrate the application shell, header, sidebar/drawer, login, shared alerts, cards, menus, and map control primitives.
4. Migrate dashboard and operations, including responsive filters and details overlays.
5. Migrate mass inclusion and the shared polygon selector.
6. Migrate zones hub, zone management, and zone assignment.
7. Migrate settings and users, including the mobile table/card presentation.
8. Run full light/dark, responsive, accessibility, build, lint, test, and functional-regression checks; remove obsolete duplicated visual classes.

Rollback is file-slice based: because no data or behavior contract changes, revert the affected visual migration slice and keep the token/primitives layer only if its consumers still pass. No database rollback is required.

## Affected Files and Risk

| Area | Expected files | Risk |
|---|---|---|
| Tokens/build | `src/styles.css`, `tailwind.config.js`, possibly PostCSS metadata only if required | Medium: global cascade/build impact |
| Font/document shell | `src/index.html`, `src/app/app.css` only if global fallback/base rules move there | Low |
| Visual primitives | `src/app/shared/components/input/input.ts`, `select/select.ts`, `textarea/textarea.ts`, new shared button directive and specs | Medium: widespread consumers, CVA must remain intact |
| App shell | `main-layout.html/.ts`, `header.ts`, `sidebar.ts` and specs | Medium: mobile navigation and fixed offsets |
| Login | `authentication/login/login.html` and existing spec | Low |
| Dashboard | `dashboard.html`, `dashboard-filters-panel.ts`, `dashboard-map.ts` and specs | Medium: rail/map sizing |
| Operations | `operations.html`, filters, map, details card and specs | Medium: overlay density and map controls |
| Mass inclusion | view HTML, form HTML, polygon selector HTML and related specs | High: dense form/map workflow with many states |
| Zones | zones hub, zone map management, zone assignment, form templates and specs | High: tabs, two map workflows, pinned actions |
| Settings/users | `settings.html/.ts`, `users.html/.ts` and new/updated specs | Medium: responsive tabs/table |
| Verification | existing Vitest specs plus focused primitive/layout specs and visual-baseline assets if adopted | Low to medium |


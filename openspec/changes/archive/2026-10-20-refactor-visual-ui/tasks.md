## 1. Baseline and Visual Token Foundation

- [x] 1.1 Capture the current light/dark UI and responsive baselines for `/login`, `/inicio`, `/operacoes`, `/inclusoes-em-massa`, `/zonas`, `/configuracoes`, and `/usuarios` at 320px, 768px, 1024px, and 1440px, and verify every route/state has a named reference image or checklist entry.
- [x] 1.2 Record a binding inventory for migrated templates (`formControlName`, form/model bindings, events, router links, and component selectors), and verify the inventory can be diffed after each migration slice.
- [x] 1.3 Add light/dark semantic CSS variables and Tailwind 4 `@theme inline` mappings for colors, typography, spacing, radii, shadows, glows, z-index, and motion in `src/styles.css`, and verify a production web build generates the semantic utilities.
- [x] 1.4 Add the explicitly loaded Tailwind configuration bridge only for configuration that cannot live in CSS, and verify CSS token definitions remain the single source of values and take precedence in the generated build.
- [x] 1.5 Add global base, scrollbar, focus-visible, and `prefers-reduced-motion` rules, and verify reduced-motion mode removes non-essential entrance/transform animations without hiding loading progress.
- [x] 1.6 Add automated token contrast tests for normal text, action foregrounds, status text, focus indicators, and disabled states in both themes, and verify every required pair meets WCAG AA.

## 2. Reusable Visual Primitives

- [x] 2.1 Implement the standalone `appButton` presentation directive with `primary`, `secondary`, `warning`, `info`, and `danger` variants plus `sm`, `md`, `iconOnly`, and `block` options, and verify it does not intercept native click, type, disabled, link, or projected-content behavior.
- [x] 2.2 Add unit tests for every button variant, size, disabled state, icon-only host treatment, and focus class contract, and verify the focused button test suite passes.
- [x] 2.3 Refactor `app-input` to consume shared compact field tokens and accept `sm`/`md` presentation sizes while preserving its ControlValueAccessor and validation API, and verify its existing consumers compile unchanged.
- [x] 2.4 Refactor native and colored-dropdown paths in `app-select` to consume shared compact field/menu tokens and accept `sm`/`md` sizes while preserving value types, multi-select behavior, selection events, and listbox semantics.
- [x] 2.5 Refactor `app-textarea` to consume shared compact field tokens and accept `sm`/`md` sizes while preserving rows, resize policy, ControlValueAccessor behavior, and validation timing.
- [x] 2.6 Add or extend unit tests for input, select/dropdown, and textarea default, hover contract, focus-visible, disabled, read-only where supported, error, single/multiple-value, blur/touched, and size states, and verify all shared-control tests pass.
- [x] 2.7 Add shared surface, card, alert/toast, menu, tab, table-row, and icon-button presentation classes, and verify a visual fixture renders every primitive in light/dark and normal/interactive states without layout shift.

## 3. Application Shell and Login

- [x] 3.1 Migrate the main layout, header, profile dropdown, theme toggle, and desktop sidebar to semantic tokens and compact primitives while preserving every existing output, signal, route, logout action, and theme persistence binding; verify the binding audit and existing shell tests pass.
- [x] 3.2 Add the narrow-screen navigation drawer behavior using the existing sidebar toggle intent, including backdrop, accessible close behavior, focus return, and full-width content offset; verify keyboard and 320px/768px interaction checks pass.
- [x] 3.3 Add or update unit tests for sidebar collapsed/drawer states, toggle events, navigation items, active route treatment, and theme initialization/persistence, and verify the shell test suite passes.
- [x] 3.4 Migrate the login screen to compact typography, shared fields/buttons/alerts, responsive spacing, and tokenized surfaces while preserving the form group, validators, password visibility, submit handler, messages, and responsive 60/40 desktop contract; verify the login binding audit and existing tests pass.
- [x] 3.5 Add login visual-state tests for invalid fields, loading/disabled submit, password toggle accessible name, error alert, 320px single-column layout, and 1024px split layout, and verify the focused tests pass.

## 4. Dashboard and Operations

- [x] 4.1 Migrate dashboard filters and map controls to shared compact fields/buttons/surfaces, and implement the responsive filter sheet/rail without changing filter models, signal updates, map initialization, or fullscreen behavior; verify existing dashboard tests and the binding audit pass.
- [x] 4.2 Add dashboard unit/component tests for filter visibility at narrow/wide layouts, preserved date/select bindings, fullscreen control naming, and map-area sizing contract, and verify the focused tests pass.
- [x] 4.3 Migrate operations filters and map controls to the same responsive sheet/rail primitives while preserving operation/date filters, selected details, map lifecycle, and fullscreen behavior; verify existing operations tests and the binding audit pass.
- [x] 4.4 Refactor spraying/inspection detail overlays into viewport-bounded responsive cards/bottom sheets with semantic status surfaces, and verify all current detail values, close action, carousel navigation, occurrence states, and scrollable content remain available.
- [x] 4.5 Add operations tests for filter bindings, details close/navigation, narrow overlay bounds, long-content scrolling, icon-button accessible names, and light/dark state classes, and verify the focused tests pass.

## 5. Mass Inclusion and Polygon Selector

- [x] 5.1 Migrate the mass inclusion screen shell, toast, form panel, map area, fullscreen control, and action footer to semantic responsive primitives while preserving all inputs, outputs, signal reads, form submission, preview, clear, and polygon events; verify its binding audit passes.
- [x] 5.2 Replace eligible native mass-inclusion fields/buttons with shared visual APIs while preserving every `formControlName`, disabled expression, value change, textarea value, and validation/preview state; verify form unit tests and a before/after control inventory pass.
- [x] 5.3 Migrate the shared polygon selector toolbar, status chips, coordinate panel, map surface, and mobile labels to semantic tokens with 44px touch targets on narrow layouts, and verify draw, undo, finish, cancel, clear, copy, and coordinate-list behavior is unchanged.
- [x] 5.4 Add or extend unit/component tests for mass inclusion compact control states, pinned action wrapping, responsive panel/map heights, toast bounds, polygon toolbar accessible names, and reduced-motion handling, and verify the focused tests pass.

## 6. Zones Hub, Management, and Assignment

- [x] 6.1 Migrate the `/zonas` hub header and tablist to semantic compact tabs while preserving query-parameter synchronization, active content switching, 44px targets, ARIA tab state, and map invalidation; verify existing zones tests pass.
- [x] 6.2 Migrate zone map management form fields, counters, validation messages, toast, pinned actions, panel/map layout, and fullscreen control to shared primitives without changing the reactive form, save/clear handlers, errors, polygon bindings, or loading states; verify its binding audit passes.
- [x] 6.3 Migrate zone assignment form, guidance/status cards, preview list, checkboxes, pinned actions, panel/map layout, and fullscreen control without changing zone selection, polygon reuse, preview selection, clear, or save behavior; verify its binding audit passes.
- [x] 6.4 Add or extend zone tests for responsive tab scrolling, management form validation/error states, assignment selection states, narrow panel/map layout, pinned action reachability, icon-button names, and all existing emitted events, and verify the focused test suites pass.

## 7. Settings and Users

- [x] 7.1 Migrate settings title, profile card, tabs, avatar actions, fields, placeholder states, and footer actions to semantic compact primitives while preserving tab state and repository data bindings; verify the settings binding audit and responsive 320px/768px/1024px checks pass.
- [x] 7.2 Add settings tests for tab selection, overflow-safe tab navigation, one/two-column field layouts, disabled profile values, and stacked mobile actions, and verify the focused tests pass.
- [x] 7.3 Migrate users header, search/action controls, role/status indicators, table, row hover, and management icon buttons to semantic primitives, removing the narrow-screen fixed minimum width while preserving displayed data and current actions; verify the users binding/data inventory passes.
- [x] 7.4 Implement the accessible narrow-screen users row/card or labeled-cell presentation without duplicating or hiding identity, role, status, and management actions, and verify there is no page-level horizontal scroll at 320px.
- [x] 7.5 Add users tests for responsive presentation, search control rendering, role/status semantics, action accessible names, row hover/focus contract, and unchanged user data rendering, and verify the focused tests pass.

## 8. Consolidation and Regression Verification

- [x] 8.1 Replace remaining duplicated legacy visual utilities in migrated UI files with semantic primitives, and verify an inventory search finds no unexplained hard-coded neutral/action palettes, generic `transition-all`, or control/button style copies in the migrated scope.
- [x] 8.2 Compare the final template binding inventory against the baseline and resolve every difference, verifying that routes, services, forms, validators, API calls, events, and map bindings have no unintended changes.
- [x] 8.3 Run `npm run lint`, `npm test`, and `npm run web:build`, and verify all commands complete successfully with no new warnings attributable to the refactor.
- [ ] 8.4 Execute keyboard-only, 200% zoom, screen-reader name/role, contrast, and reduced-motion checks in light and dark themes, and verify all findings required by the specs are closed.
- [ ] 8.5 Repeat visual comparison at 320px, 768px, 1024px, and 1440px for every active route and key state, and verify no unintended horizontal scroll, clipping, overlay collision, hidden action, or theme inconsistency remains.
- [ ] 8.6 Run the functional smoke checklist for login, theme, navigation, filters, dropdowns, map fullscreen, polygon drawing, mass preview/save path, zone create/assignment path, settings tabs, and current users actions, and verify behavior matches the pre-refactor baseline.

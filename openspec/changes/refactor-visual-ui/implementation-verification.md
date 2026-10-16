# UI Refactor Verification

## Binding and behavior audit

The post-migration template/TypeScript diff was compared with `implementation-baseline.md`.

- Routes, guards, route paths, query-parameter names, repositories, services, API/Supabase calls, validators, form-control names, map initialization calls, and domain models were not changed.
- Existing form/model bindings and action events remain attached to the same view-model methods. Presentation-only attributes, ARIA state, compact size inputs, and responsive classes were added.
- The only new UI state is the narrow-screen navigation drawer. Desktop collapse remains a separate signal; Escape/backdrop/navigation close the drawer and return focus to the existing header toggle.
- Shared input/select/textarea changes retain their ControlValueAccessor contracts. The button directive only projects classes/data attributes and does not intercept native behavior.

## Legacy utility inventory

- Generic `transition-all` has no matches in the migrated UI scope.
- Repeated control, field, surface, menu, tab, table-row, alert/toast, and icon-button styling is consolidated in `src/styles.css` and `appButton`.
- Remaining explicit hue utilities are intentional data/status visualization accents (map markers, occurrence severity/state, polygon drawing feedback) or third-party map/avatar fallbacks. Neutral layout and interactive control styling uses semantic tokens.

## Automated verification

- Focused primitive/screen suites: passed.
- Full Angular/Vitest suite: 55 files, 275 tests passed.
- Lint: passed.
- Production web build: passed; the existing Leaflet CommonJS optimization warning remains unrelated to this refactor.

## Manual validation still required

Authenticated, data-backed route captures and functional smoke flows must be executed in the target desktop runtime at the baseline viewport/theme matrix before tasks 8.4-8.6 can be closed.

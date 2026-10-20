# UI Refactor Implementation Baseline

This checklist is the named pre-change reference for the visual refactor. Each route must preserve the listed surfaces and behavior at 320px, 768px, 1024px, and 1440px in light and dark themes.

| Route | Baseline surfaces and states |
|---|---|
| `/login` | Mobile brand block; desktop 60/40 split; email/password controls; password visibility; assistance actions; error alert; loading submit |
| `/inicio` | Filter rail and map; date, zone, occurrence, plant status, and variety filters; fullscreen map control |
| `/operacoes` | Filter rail and map; period/type filters; spraying and inspection details; carousel and fullscreen states |
| `/inclusoes-em-massa` | Responsive form/map split; toast states; disabled/editable form; polygon toolbar; preview; pinned actions; fullscreen |
| `/zonas` | Accessible two-tab hub; management and assignment panels; form errors; preview lists; polygon controls; pinned actions; fullscreen |
| `/configuracoes` | Scrollable tabs; profile identity and avatar actions; disabled fields; placeholder tabs; footer actions |
| `/usuarios` | Heading/action; search/export/filter controls; identity, role, status and management columns; row hover |

## Shared state matrix

- Themes: light and dark.
- Viewports: 320px, 768px, 1024px, and 1440px.
- Controls: default, hover, focus-visible, disabled, read-only where supported, invalid, loading, and dropdown-open.
- Motion: normal and `prefers-reduced-motion: reduce`.
- Content: short, long/truncated, empty, loading, success, warning, information, and error.
- Navigation: expanded/collapsed desktop rail and narrow drawer.

## Binding inventory contract

- Preserve every `(event)` expression, `[property]`/model binding, `formGroup`, `formControlName`, validator, disabled expression, `routerLink`, route, query parameter, component selector, and input/output name.
- Preserve all view-model, repository, service, API, Supabase, and Leaflet calls.
- Presentation inputs, classes, ARIA attributes, keyboard affordances, and responsive UI state may be added without replacing the contracts above.

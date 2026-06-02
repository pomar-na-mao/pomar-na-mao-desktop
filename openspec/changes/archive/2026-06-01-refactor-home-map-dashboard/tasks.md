## 1. Home data sources

- [x] 1.1 Audit the current `DashboardViewModel`, `HomeStatsService`, and `PlantsRepository` flows to identify which home metrics can be reused and which require a new aggregated backend response.
- [x] 1.2 Implement or adapt the Supabase-backed data source for the left-side cards so the home can load totals for `plants`, `zones`, `occurrence_types`, and `varieties` during initialization.
- [x] 1.3 Ensure the home data source also returns the variety list needed to build a deterministic color legend for the map and the varieties card.
- [x] 1.4 Update or add tests for the new home metrics data contract.

## 2. Dashboard state and map behavior

- [x] 2.1 Refactor `DashboardViewModel` to remove filter-driven initial map behavior and load all plottable plants as part of the initial home fetch.
- [x] 2.2 Add state for left-side operational cards, right-side mock cards, variety legend entries, and all plotted plants.
- [x] 2.3 Implement deterministic variety-to-color mapping with an explicit fallback color for plants without variety.
- [x] 2.4 Update map plotting so plant markers render with the assigned variety colors and the map opens already populated.

## 3. Home layout refactor

- [x] 3.1 Replace the current home/dashboard composition with a three-column layout: left card stack, central map, and right card stack.
- [x] 3.2 Implement the four left-side button-style cards for totals of `plants`, `zones`, `occurrence_types`, and `varieties`.
- [x] 3.3 Implement the varieties card legend so each legend entry matches the color used for the corresponding plant markers on the map.
- [x] 3.4 Implement the four right-side button-style cards with mocked values for `Pulverizações`, `Anotações`, `Inspeções`, and `Colheita`.
- [x] 3.5 Remove or retire unused dashboard header, metrics, recent-activities, and filter UI that no longer belongs to the refactored home surface.

## 4. Validation

- [x] 4.1 Add or update component/view-model tests covering initial totals load, initial plant plotting, and variety color legend behavior.
- [x] 4.2 Run TypeScript validation.
- [x] 4.3 Run automated tests.
- [x] 4.4 Run web build validation and verify the refactored home route renders successfully.

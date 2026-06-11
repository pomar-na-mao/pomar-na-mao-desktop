## Context

The application recently adopted a compact input styling to match the dashboard panel. However, the user requested that all inputs, selects, and textareas across all screens be updated to follow the more spacious style originally present in the Mass Inclusion form. This style uses `rounded-lg` borders, larger padding (`py-2.5 px-3`), and standard `text-sm` text.

## Goals / Non-Goals

**Goals:**
- Update the shared `<app-input>`, `<app-select>`, and `<app-textarea>` components to apply the spacious "mass inclusion" design globally.
- Update raw input fields and selectors in `dashboard-filters-panel.ts` to use `<app-input>`/`<app-select>` or match the spacious styling, ensuring global alignment.
- Ensure proper sizing and alignment of icons with the new `px-3` / `pl-10` paddings.
- Standardize labels to `text-sm font-medium`.

**Non-Goals:**
- Removing the dashboard sidebar completely.
- Modifying non-input elements (like buttons or cards) unless their layout is broken by the input size changes.

## Decisions

### 1. Update Shared Components (`app-input`, `app-select`, `app-textarea`)
- **Decision**: Update classes to standard spacious sizes.
- **Styling**: Use `block w-full py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none`.
- **Labels**: Use `block text-sm font-medium text-slate-700 dark:text-slate-300`.
- **Icon Padding**: Use `pl-10` when an icon is present to accommodate standard size icons properly.

### 2. Update Dashboard Filters Panel
- **Decision**: Replace raw HTML `<input>` and `<select>` elements in `dashboard-filters-panel.ts` with the shared `<app-input>` and `<app-select>` components to ensure they inherit the new global spacious style. 

## Risks / Trade-offs

- **Risk**: The dashboard sidebar has a fixed width (`w-[280px]`). Taller and more spacious inputs might cause the sidebar to scroll more frequently.
  - **Mitigation**: The sidebar already has `overflow-y-auto`, so scrolling is handled natively without breaking layout.

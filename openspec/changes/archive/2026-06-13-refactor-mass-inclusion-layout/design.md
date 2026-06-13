## Context

The mass inclusion screen currently has a layout that does not match the dashboard and operations screens. It has margins around the container, a top zone filter bar above the map, and a wider form panel. To improve visual consistency, we want to unify all map-related views to share the same side-by-side layout: a left-aligned sidebar filter/form (`aside`) and a full-height map on the right.

## Goals / Non-Goals

**Goals:**
- Unify the layout of the mass inclusion screen with the dashboard and operations screens.
- Move the Zone selector dropdown from the top bar to the top of the left sidebar form.
- Remove the obsolete `app-mass-inclusion-map-filters` component.
- Ensure the layout is responsive and correctly calculates heights without header overlaps.

**Non-Goals:**
- Changing the underlying business logic, state management, or validation rules in `MassInclusionViewModel`.
- Modifying database schemas, tables, or RPC calls.

## Decisions

### 1. Unified Side-by-Side Flex Layout
* **Decision**: Refactor the root element in `mass-inclusion.html` to match the dashboard and operations layout.
* **Details**: Use `flex h-[calc(100vh-64px)] overflow-hidden` on the parent container, `<aside class="flex h-full w-[380px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-950/60">` for the form sidebar, and `<div class="flex-1 relative overflow-hidden h-full">` for the map selector area. Additionally, the form container itself is made flat (without border-radius, background card colors, or shadows) so it integrates seamlessly with the sidebar background.
* **Rationale**: This is a direct replication of the layout pattern established in dashboard and operations screens, ensuring visual parity.

### 2. Relocate Zone Selector
* **Decision**: Place the `<app-select>` for the Zone dropdown at the top of the form, directly inside the `<form>` element in `mass-inclusion-form.html`, inside the scrollable container.
* **Rationale**: Moving it inside the form group groups all inputs and configurations in one single panel, simplifying user interaction.

### 3. Cleanup Filters Component
* **Decision**: Delete the files in `src/app/ui/components/mass-inclusion/mass-inclusion-map-filters/` and remove all references in the import arrays of views.
* **Rationale**: Once the Zone selector is moved to the form, the map filters component becomes obsolete and unused.

## Risks / Trade-offs

- **[Risk]** The form length might increase and push some fields (like Observações or Preview) below the fold.
  * *Mitigation*: The scrollable container `lg:overflow-y-auto` already handles overflow gracefully, and since the form width is reduced to 320px, it fits nicely.

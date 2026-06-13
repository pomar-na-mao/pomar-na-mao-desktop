## Why

The current layout of the mass inclusion screen differs from the dashboard and operations screens (which use a full-height sidebar on the left and a map on the right). Unifying the layout across all map-related screens simplifies the UI, improves screen space efficiency, and provides a consistent user experience.

## What Changes

- **Layout Refactoring**: Modify the layout of the mass inclusion screen to use a full-height flex container (`h-[calc(100vh-64px)]`) with a 320px wide left sidebar (`aside`) and a full-height map area on the right.
- **Zone Selector Relocation**: Move the Zone select dropdown from the top map filter bar to the top of the mass inclusion form on the left sidebar.
- **Component Cleanup**: Remove the now-obsolete `app-mass-inclusion-map-filters` component.

## Capabilities

### New Capabilities
<!-- No new capabilities needed -->

### Modified Capabilities
- `mass-inclusion-polygon-bulk-update`: Move zone selection into the left sidebar form and align the overall screen layout with the dashboard/operations side-by-side format.

## Impact

- `src/app/ui/views/mass-inclusion/mass-inclusion.html` (Layout updated, filters removed)
- `src/app/ui/views/mass-inclusion/mass-inclusion.ts` (Remove imports of filter component)
- `src/app/ui/components/mass-inclusion/mass-inclusion-form/mass-inclusion-form.html` (Zone selector added at the top)
- `src/app/ui/components/mass-inclusion/mass-inclusion-form/mass-inclusion-form.ts` (Expose zone select handlers)
- Remove `src/app/ui/components/mass-inclusion/mass-inclusion-map-filters/` directory

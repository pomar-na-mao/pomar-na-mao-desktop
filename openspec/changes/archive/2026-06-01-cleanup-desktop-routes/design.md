## Context

The Angular desktop app defines a public `login` route and an authenticated main layout at `path: ''`. The main layout currently includes active child routes beyond the requested desktop surface: `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, and `reports`. The sidebar also links to removed routes, and route-specific folders exist under views, components, view-models, data services, and repositories.

## Goals / Non-Goals

**Goals:**
- Keep the login screen and authenticated layout working.
- Keep only `home`, `inclusoes-em-massa`, `settings`, and `users` as authenticated child routes.
- Remove files and tests that are exclusively related to deleted routes.
- Remove or update remaining navigation references to deleted routes.
- Preserve shared code that is still used by retained screens.

**Non-Goals:**
- Redesign the retained screens.
- Change authentication, authorization, or Supabase behavior.
- Remove domain/data modules that are still imported by retained screens.
- Add replacement screens for deleted functionality.

## Decisions

1. Remove unsupported routes from `app.routes.ts` instead of guarding or hiding them.
   - Rationale: the requested cleanup is explicit removal of route availability and related files.
   - Alternative considered: leave routes registered but remove sidebar links. This would keep unsupported screens accessible by direct URL.

2. Delete only route-exclusive implementation files.
   - Rationale: route features share some services and repositories with retained screens, especially mass inclusion and dashboard flows. Removing shared modules would create avoidable regressions.
   - Alternative considered: delete folders by feature name broadly. This is faster but risks removing code still required by kept routes.

3. Update surviving navigation targets to retained routes.
   - Rationale: code such as table/detail actions currently navigates back to `sincronizacoes`; after removal these actions must either point to a retained route or be removed with the deleted feature.
   - Alternative considered: keep stale navigation and rely on wildcard redirect. That would produce confusing UX and mask broken references.

4. Validate with TypeScript, lint, and tests after deletion.
   - Rationale: file deletion can leave stale imports, declarations, and test references.
   - Alternative considered: manual inspection only. That is not sufficient for a cross-folder cleanup.

## Risks / Trade-offs

- Deleted files may include code that is indirectly reused by retained screens -> Mitigate by checking imports with `rg` before deleting and running build/test validation.
- Some unsupported feature data services may be unused by routes but still needed by shared view-models -> Mitigate by deleting from leaf route folders upward and preserving modules referenced by kept screens.
- Browser history or external bookmarks to removed routes will redirect through existing fallback behavior -> Mitigate by keeping wildcard redirect to `login` unless implementation discovers an existing app-level redirect pattern that should be preserved.
- Tests for deleted features will be removed, reducing historical coverage for those features -> Accepted because the features are no longer part of the desktop surface.

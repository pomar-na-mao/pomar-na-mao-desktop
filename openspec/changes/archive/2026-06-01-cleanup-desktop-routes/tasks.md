## 1. Route Surface

- [x] 1.1 Update `src/app/app.routes.ts` to keep `login`, the authenticated main layout, child routes `home`, `inclusoes-em-massa`, `settings`, `users`, the default redirect to `home`, and the wildcard redirect.
- [x] 1.2 Remove child route entries for `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, and `reports`.

## 2. Navigation Cleanup

- [x] 2.1 Update the sidebar menu to include only retained authenticated route links.
- [x] 2.2 Search retained source files for navigation or links to removed route paths and remove or redirect those references to retained routes as appropriate.

## 3. Route-Exclusive File Deletion

- [x] 3.1 Delete view folders and tests that only back removed routes, including `syncs`, `spraying-flow`, `admin`, and `reports`.
- [x] 3.2 Delete UI components that are imported only by removed route views.
- [x] 3.3 Delete view-models that are imported only by removed route views or route-exclusive components.
- [x] 3.4 Delete data services, repositories, and tests that are used only by removed route features.
- [x] 3.5 Preserve any shared files still imported by `home`, `inclusoes-em-massa`, `settings`, `users`, or `login`.

## 4. Verification

- [x] 4.1 Run `rg` checks for removed route paths and route-exclusive imports to confirm no stale references remain in retained source.
- [x] 4.2 Run TypeScript validation.
- [x] 4.3 Run lint.
- [x] 4.4 Run automated tests and fix failures caused by the cleanup.

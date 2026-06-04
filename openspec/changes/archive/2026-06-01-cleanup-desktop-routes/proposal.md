## Why

The desktop web app still exposes routes and related UI code for screens that should no longer be part of the Pomar na Mao desktop surface. This cleanup reduces maintenance cost and prevents users from navigating to unsupported areas.

## What Changes

- Keep the public login screen available.
- Keep only the authenticated child routes `home`, `inclusoes-em-massa`, `settings`, and `users` under the `path: ''` main layout.
- Remove route entries for `sincronizacoes`, `fluxo-pulverizacao`, `administracao`, and `reports`.
- Delete view files, components, view-models, data services/repositories, tests, and navigation entries that exist only to support the removed routes.
- Update remaining internal navigation so it does not point to deleted routes.

## Capabilities

### New Capabilities
- `desktop-route-surface`: Defines the supported desktop web route surface and the cleanup expectations for unsupported route-specific code.

### Modified Capabilities

## Impact

- Affected code includes `src/app/app.routes.ts`, layout/sidebar navigation, removed route view folders, route-specific UI components, view-models, data services/repositories, and related tests.
- No public API or dependency changes are expected.
- Build and test commands may need updates only if deleted specs were referenced by test configuration or imports.

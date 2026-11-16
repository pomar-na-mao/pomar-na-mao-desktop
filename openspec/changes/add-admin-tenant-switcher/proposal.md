## Why

Administrators currently need a tenant-specific build to access each customer Supabase project, which makes operational switching slow and risks mixing stale application state with another customer's data. The application also assigns new role records as `admin` by default, granting more privilege than necessary.

## What Changes

- Add an administrator-only tenant selector fixed to the bottom of the active sidebar, displaying the aliases documented in `TENANT_CONFIG.md`.
- When a different tenant is selected, require email and password in a modal, authenticate against an isolated client for the target Supabase project, and verify that the target account also has the `admin` role.
- Keep the current tenant and session untouched when the current option is selected, the modal is cancelled, authentication fails, or target authorization fails.
- Isolate Supabase sessions and cached data per tenant; after a successful switch, persist only the selected tenant identifier and reload the application against the authenticated target tenant.
- Change `public.user_roles.role` to default to `user` and constrain values to `admin` or `user` through an idempotent migration intended for every tenant database.
- Update `database.md` with the revised role default, allowed values, authorization behavior, rollout expectations, and migration details.
- Add unit tests for tenant selection, authorization, failure rollback, session isolation, reload behavior, role typing, and database migration invariants.

## Capabilities

### New Capabilities

- `admin-tenant-switching`: Administrator-only discovery and secure switching among the configured customer Supabase projects.
- `user-role-governance`: Least-privilege role defaults and strict support for only the `admin` and `user` roles.

### Modified Capabilities

None.

## Impact

- Affects the Angular sidebar/layout, tenant environment configuration, Supabase client lifecycle, authentication and role repositories, request cache handling, and related unit tests.
- Requires an idempotent SQL migration under `supabase/migrations` and synchronized documentation changes in `database.md`.
- The migration must be applied and verified independently in all three configured Supabase projects; existing valid `admin` assignments remain unchanged, while unsupported legacy role values require an explicit safe conversion policy before the constraint is installed.
- No service-role key or secret credential is introduced in the client. Only public Supabase project configuration remains bundled; passwords are never persisted by the tenant-switch workflow.

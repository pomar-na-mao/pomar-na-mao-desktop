## Context

See `proposal.md` for motivation. Tenant metadata already exists in `src/environments/client-config.ts`, but `APP_CONFIG` resolves one tenant at build time. `SupabaseService` constructs a singleton client from that static configuration, and many root-scoped services capture the client during construction. Authentication is persisted and request data is cached, so mutating a URL/key at runtime would leave existing services and state bound to the previous customer.

The active layout renders `AppSidebar`, whose current content is `AppMenu`. Role data is loaded from `public.user_roles` by the authenticated-route guard and exposed through `UserRolesRepository.isUserAdmin`. The database currently documents `role text not null default 'admin'`, has RLS allowing users to read their own role, and does not constrain the role values.

## Goals / Non-Goals

**Goals:**

- Make tenant choice a runtime bootstrap concern while retaining the existing build-time tenant as a safe default.
- Make switching transactional from the user's perspective: either target login and authorization fully succeed, or the current tenant remains untouched.
- Keep authentication storage, request caches, and application state isolated by tenant.
- Enforce the same least-privilege role contract in all tenant projects and in TypeScript.
- Preserve the existing application data-loading paths by reinitializing through a full reload after a successful switch.

**Non-Goals:**

- A central identity provider, cross-project single sign-on, or automatic account provisioning across tenants.
- Storing passwords or copying refresh/access tokens between Supabase projects.
- Allowing non-admin target accounts to use the administrative tenant-switch workflow.
- Dynamically fetching private tenant configuration from a backend; Supabase publishable configuration remains client-visible by design.
- Changing ownership or CRUD RLS policies beyond the role-column contract.

## Decisions

### 1. Resolve the active tenant before dependency injection starts

Introduce a tenant catalog derived from `CLIENT_CONFIGS`, including the documented aliases, and resolve `activeTenantId` synchronously from tenant-specific local storage before `SupabaseService` is constructed. An unknown stored identifier falls back to `DEFAULT_CLIENT_ID`. `APP_CONFIG` remains the environment/build envelope, while Supabase URL/key selection comes from the resolved runtime tenant.

When an npm/Angular configuration explicitly defines `NG_CLIENT_ID`, bootstrap records that configured tenant. If it differs from the last tenant-specific startup mode, bootstrap removes the previously persisted active-tenant selector and initializes the newly commanded tenant. Reloading the same configured build still honors a tenant committed by the administrative switch, so the switch-and-reload flow does not bounce back to the build tenant. A generic startup clears the configured-mode marker and continues to honor the persisted runtime selection.

This avoids rebuilding Angular's injector or teaching every data service to react to a client swap. The alternative—mutating the singleton client's internals—was rejected because existing auth listeners, realtime channels, cached promises, and captured client references could continue serving the previous tenant.

### 2. Namespace Supabase auth storage per tenant

Every Supabase client uses a deterministic storage key containing the tenant ID. The active client persists normally under its tenant key. A target client created for switching uses the target configuration and target storage key, so it can establish the target session without overwriting the current session.

Project URLs alone are not used as persisted selector values; only allow-listed `ClientId` values are accepted. Passwords remain local variables in the modal/switch operation and are cleared on all completion paths.

The alternative of one shared Supabase storage key was rejected because sessions from independent projects could overwrite or be restored into the wrong client.

### 3. Use a two-phase switch: validate, then commit

Phase one creates an isolated target client, signs in with email/password, and reads only the authenticated user's own `user_roles` row using existing RLS. Missing, unsupported, or non-`admin` roles fail closed. On failure or cancellation, the provisional target client signs out, its newly written target session is removed, and the active tenant/session remains unchanged.

Phase two runs only after the target returns `admin`: clear the application request cache and tenant-sensitive repository state, persist the target tenant ID, dispose temporary listeners/client resources where applicable, and perform a full page reload. Bootstrap then constructs the normal singleton for the target and restores its namespaced session.

The alternative of accepting any successfully authenticated target role was rejected: the selector is an administrative capability, and allowing it to land on a `user` account makes the authorization boundary inconsistent after reload.

### 4. Put orchestration outside the presentational menu

Create a tenant-session/switch coordinator responsible for catalog access, target authentication, role verification, commit, rollback, and busy/error state. The active `AppSidebar` places a dedicated self-closing tenant-switcher component after the scrollable menu and anchors it at the bottom. The component reads `isUserAdmin`, displays aliases, and owns the credential modal's form behavior, but delegates security-sensitive operations to the coordinator.

The selector value is derived from committed state rather than optimistically changed; therefore cancellation and errors naturally display the current tenant. Unit tests cover the coordinator independently and the sidebar/component's conditional rendering and interactions.

### 5. Keep aliases explicit and configuration type-safe

Extend each tenant catalog entry with its alias (`Ricardo Lichia`, `Hass Avocado`, and `Ricardo Abacate`) and expose a typed, ordered list for UI consumption. `TENANT_CONFIG.md` remains the human-facing source that must agree with code; no credentials are parsed from Markdown at runtime.

Parsing the documentation file at runtime was rejected because it is not bundled as a stable application API and would blur configuration validation.

### 6. Enforce roles with an idempotent database migration

Add a timestamped migration that:

1. normalizes every role not in (`admin`, `user`) to `user`;
2. changes the column default to `'user'`;
3. replaces a predictably named check constraint with `CHECK (role IN ('admin', 'user'))`;
4. leaves `NOT NULL`, existing valid admins, and the existing own-role SELECT policy intact.

The application model becomes `type UserRole = 'admin' | 'user'`; obsolete treasury/secretary computed helpers are removed or replaced as part of implementation. `database.md` must update both the focused `user_roles` section and duplicated full-schema SQL so a fresh database and a migrated database converge.

Converting unsupported legacy roles to `user` was chosen over aborting deployment because it is deterministic and least-privileged. The migration task includes a preflight report/query so operators can review affected rows before applying it to each project.

### 7. Deploy the schema change to every tenant project explicitly

Because each customer has a separate Supabase database, implementation uses the configured Supabase MCP project connections to apply the same migration independently to all three projects, then verifies the default, constraint, and role counts in each. Committing the SQL file alone is not considered database rollout completion.

## Risks / Trade-offs

- [A successful target login persists a provisional session before role validation] → Use a tenant-specific key, track whether the switch created/replaced it, and sign out/remove the provisional session on authorization failure without touching the current tenant key.
- [A previously persisted target session could be replaced by a failed attempt] → Treat explicit credential submission as authoritative and document/test cleanup semantics; never fall back to an older target session after failed credentials.
- [Full reload is heavier than reactive data refresh] → It provides a clean injector, auth listener, cache, realtime, and repository boundary; retain this until services are designed for live client replacement.
- [Client-side visibility alone is not an authorization boundary] → Verify `admin` against the target database under RLS and fail closed; public keys do not grant service-role access.
- [Three databases can drift] → Apply and verify the identical migration per project and record expected checks in tasks/database documentation.
- [Existing unsupported roles lose specialized meaning] → Run a preflight inventory, convert them to least-privileged `user`, and require deliberate reassignment to `admin` where justified.
- [Bundled tenant catalog reveals project URLs and publishable keys] → Accept this as normal Supabase public-client configuration; never include service-role keys or passwords.

## Migration Plan

1. Run a read-only preflight against each tenant to inventory role values and identify rows that will become `user`.
2. Add and review the idempotent migration plus synchronized `database.md` definitions.
3. Apply the migration to a non-production/selected tenant first through Supabase MCP; verify the default, check constraint, valid-role counts, and own-role read policy.
4. Apply and verify the same migration in the remaining tenant projects.
5. Release the runtime tenant bootstrap, isolated auth storage, coordinator, sidebar selector, modal, and tests after all databases accept the new role contract.
6. Smoke-test successful switching in both directions, cancellation, invalid credentials, a target `user`, invalid stored tenant ID, and cache/session separation.

Rollback of the application restores the previous build-time selection behavior but must not reuse a target session under the wrong project. Database rollback may drop the check constraint and restore the former default only if operationally necessary; normalized legacy values cannot be reconstructed automatically and must be restored from the preflight export if required.

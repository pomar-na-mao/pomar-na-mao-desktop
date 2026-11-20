## 1. Tenant and Role Foundations

- [x] 1.1 Add aliases and typed runtime tenant catalog/resolution to the environment configuration, including allow-listed stored-ID validation and default fallback; verify unit tests cover all three aliases, a valid stored tenant, an absent value, and an unknown value.
- [x] 1.2 Change the application role model to the closed union `admin | user`, remove obsolete treasury/secretary role helpers, and verify TypeScript compilation plus repository unit tests accept only the supported roles.
- [x] 1.3 Add deterministic tenant-specific Supabase auth storage keys and make the primary Supabase client initialize from the resolved runtime tenant; verify service tests prove clients cannot restore another tenant's session.

## 2. Secure Tenant Switch Orchestration

- [x] 2.1 Implement a tenant-switch coordinator that creates an isolated target client, authenticates explicit credentials, reads the target user's own role, and exposes busy/error results; verify unit tests cover valid admin, invalid credentials, missing role, `user`, and unsupported role responses.
- [x] 2.2 Implement failure and cancellation cleanup so provisional target sessions, credentials, listeners, and state are discarded without changing the active tenant/session; verify unit tests assert the active storage key, current session, cache, and committed selector value remain unchanged.
- [x] 2.3 Implement successful commit behavior that clears request/repository state, persists only the allow-listed target ID, and reloads the application; verify unit tests assert commit ordering and that reload is invoked only after target `admin` authorization.

## 3. Administrator Sidebar Experience

- [x] 3.1 Create the tenant selector and credential-modal component using the project's visual conventions and self-closing component imports; verify component tests cover alias rendering, active selection, target alias in the modal, password input behavior, busy state, and accessible labels/focus.
- [x] 3.2 Render the selector at the bottom of the active `AppSidebar` only when `UserRolesRepository.isUserAdmin()` is true, keeping the menu region independently scrollable; verify sidebar tests cover admin, user, unresolved-role, expanded, collapsed, desktop, and mobile states.
- [x] 3.3 Wire selector events to no-op on the active tenant and to open the modal only for a different tenant; verify component tests prove current selection sends no auth request and cancel/error restores the committed value.

## 4. Database Role Contract

- [x] 4.1 Use read-only Supabase MCP queries against each of the three configured projects to inventory `user_roles.role` values and save a non-secret preflight summary for migration review; verify every project is accounted for before mutation.
- [x] 4.2 Add an idempotent timestamped migration that converts unsupported roles to `user`, changes the default to `user`, and replaces a named check constraint allowing only `admin` and `user`; verify the SQL preserves existing valid admins and can run twice without duplicate-object errors.
- [x] 4.3 Update every canonical `user_roles` definition and the migration/rollout guidance in `database.md` with the new default, value constraint, legacy conversion, unchanged own-role RLS behavior, and three-project deployment requirement; verify repository search finds no remaining `user_roles` definition with default `admin`.
- [x] 4.4 Apply the migration through Supabase MCP to each configured tenant project, starting with one project and then the remaining two; verify per project that the column default is `user`, the named constraint exists, only supported values remain, and the own-role SELECT policy still works.

## 5. Integration and Regression Verification

- [x] 5.1 Add integration-focused unit tests for switching between distinct mocked project configurations and verify successful reload shows only target data while failed/cancelled attempts retain only current data.
- [x] 5.2 Run the affected Vitest suites, full unit test suite, static analysis/lint, and production web build; verify all commands complete without new failures or warnings attributable to this change.
- [ ] 5.3 Perform a manual smoke test with test accounts across configured tenants for current-tenant no-op, cancellation, bad password, target `user`, successful target `admin`, persisted reload, and reverse switching; record results without storing credentials or tokens.

## 6. Follow-up Experience and Startup Precedence

- [x] 6.1 Make an explicitly configured `web:serve:<tenant>` startup clear the previous active-tenant selection and take precedence over it; verify unit tests cover explicit and generic startup modes.
- [x] 6.2 Redesign the administrator tenant area and credential modal with the project's shared select and PrimeNG visual patterns, including dark mode, busy state, focus, and accessible labels.
- [x] 6.3 Run affected tests, the full unit suite, lint, and a tenant-specific production build; verify the follow-up introduces no regressions.
- [x] 6.4 Restore the sidebar's hidden-scrollbar behavior, add spacing between menu content and the tenant card, and isolate compact card typography from global heading rules; verify component tests cover the layout classes and title element.
- [x] 6.5 Pin the administrator card in the sidebar footer while making only the menu region scrollable with its scrollbar hidden; verify layout tests cover the fixed footer and scroll-region classes.
- [x] 6.6 Add a theme-aware divider above the pinned administrator card while preserving the spacing from the scrollable menu; verify the sidebar test covers the divider and padding classes.
- [x] 6.7 Match the tenant dropdown's shared component, default height, and font sizing to "Variedade Existente" without adding a label; verify component tests cover the matching default size and label absence.

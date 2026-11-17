## Purpose

Define secure, observable behavior for administrators to move between configured customer projects without mixing credentials, sessions, caches, or customer data.

## ADDED Requirements

### Requirement: Tenant selector visibility and placement
The system SHALL show a tenant selector at the bottom of the active sidebar only when the authenticated user has the `admin` role in the active tenant. The selector SHALL list every configured tenant by its documented alias and SHALL identify the currently active tenant.

#### Scenario: Administrator views the sidebar
- **WHEN** an authenticated user has role `admin` in the active tenant
- **THEN** the sidebar shows the tenant selector at its bottom with the configured aliases and current tenant selected

#### Scenario: Regular user views the sidebar
- **WHEN** an authenticated user has role `user` or has no resolved role in the active tenant
- **THEN** the sidebar does not render or expose the tenant selector

### Requirement: Selecting the current tenant is a no-op
The system SHALL leave authentication, navigation, cached data, and visible content unchanged when the administrator selects the tenant that is already active.

#### Scenario: Current tenant is selected
- **WHEN** the administrator selects the already active tenant
- **THEN** no credential modal opens, no authentication request is sent, and no reload occurs

### Requirement: Credentials are requested only for a different tenant
The system SHALL open a modal requesting email and password after a different tenant is selected. The modal SHALL identify the target tenant alias and SHALL not persist, log, prefill from stored credentials, or otherwise retain the password after submission or cancellation.

#### Scenario: Different tenant is selected
- **WHEN** the administrator selects a configured tenant different from the active tenant
- **THEN** a credential modal opens for that target alias while the current tenant remains active

#### Scenario: Tenant switch is cancelled
- **WHEN** the administrator cancels or closes the credential modal
- **THEN** the password is discarded and the current tenant, session, data, and selector value remain unchanged

### Requirement: Target authentication and authorization are isolated
The system MUST authenticate the supplied credentials against the target tenant without replacing or signing out the current tenant session. A switch SHALL be authorized only when authentication succeeds and the authenticated target user has role `admin` in that target tenant.

#### Scenario: Target credentials are invalid
- **WHEN** target authentication fails
- **THEN** the system reports the failure without disclosing sensitive details and preserves the current tenant session and data

#### Scenario: Target account is not an administrator
- **WHEN** target authentication succeeds but the target account has role `user`, no role row, or an unsupported role value
- **THEN** the system rejects the switch, removes the provisional target session, reports insufficient permission, and preserves the current tenant session and data

#### Scenario: Target account is an administrator
- **WHEN** target authentication succeeds and the target account has role `admin`
- **THEN** the system is permitted to commit the tenant switch

### Requirement: Tenant sessions and cached data are isolated
The system MUST use tenant-specific authentication storage and MUST prevent request-cache entries or in-memory state from one tenant from being served while another tenant is active.

#### Scenario: Two tenants have persisted sessions
- **WHEN** sessions exist for more than one configured tenant
- **THEN** each tenant client reads only its own session and never adopts another tenant's tokens

#### Scenario: Tenant switch commits
- **WHEN** the target administrator is authenticated and authorized
- **THEN** the system clears tenant-sensitive in-memory state, persists only the target tenant identifier as active, and reloads the application against the target tenant configuration

### Requirement: Reloaded application reflects only the committed tenant
After a successful switch, the system SHALL initialize all Supabase-backed services with the committed target configuration, restore the target session, reload application data, and update the screen. If the stored tenant identifier is missing or invalid, the system SHALL use the configured default tenant.

#### Scenario: Successful switch reloads the application
- **WHEN** a switch to a target administrator account is committed
- **THEN** the reloaded application shows the target alias and data obtained only from the target Supabase project

#### Scenario: Stored tenant identifier is invalid
- **WHEN** application startup finds a tenant identifier that is not in the configured catalog
- **THEN** the application ignores it and starts with the configured default tenant without using unrecognized project configuration

#### Scenario: Startup command explicitly selects a tenant
- **WHEN** application startup is launched with a tenant-specific npm/Angular configuration different from the last configured startup mode
- **THEN** the newly configured tenant takes precedence, the previously persisted active-tenant selection is removed, and all services initialize against the commanded tenant

#### Scenario: Administrative switch reloads the same configured build
- **WHEN** an administrative switch commits a target tenant and reloads the same tenant-specific build
- **THEN** bootstrap honors the committed target tenant instead of reverting to the build tenant

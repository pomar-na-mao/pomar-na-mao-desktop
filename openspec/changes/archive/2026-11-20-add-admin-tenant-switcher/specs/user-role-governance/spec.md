## Purpose

Establish least-privilege role provisioning and a strict, portable role contract that is consistent across every customer Supabase project.

## ADDED Requirements

### Requirement: New role rows default to regular users
The `public.user_roles.role` column SHALL default to `user` whenever an insert omits the role, preventing implicit administrator access.

#### Scenario: Role is omitted on insert
- **WHEN** a `user_roles` row is inserted without an explicit role
- **THEN** the stored role is `user`

#### Scenario: Administrator role is assigned explicitly
- **WHEN** an authorized operation inserts or updates a role to `admin`
- **THEN** the stored role remains `admin`

### Requirement: Only supported roles can be stored
The database MUST accept only `admin` and `user` in `public.user_roles.role`, and the application role model SHALL represent the same closed set.

#### Scenario: Supported role is written
- **WHEN** a role is written as `admin` or `user`
- **THEN** the database accepts the value

#### Scenario: Unsupported role is written
- **WHEN** a role value other than `admin` or `user` is written
- **THEN** the database rejects the write

### Requirement: Existing roles migrate safely and consistently
The role migration SHALL preserve existing `admin` and `user` values, convert any unsupported legacy value to `user`, install the default and constraint idempotently, and be applicable to every configured tenant database.

#### Scenario: Existing administrator is migrated
- **WHEN** the migration processes a row whose role is `admin`
- **THEN** the row remains `admin`

#### Scenario: Existing unsupported role is migrated
- **WHEN** the migration processes a row whose role is neither `admin` nor `user`
- **THEN** the row is changed to `user` before the constraint is enforced

#### Scenario: Migration is run again
- **WHEN** the migration is reapplied to an already migrated tenant database
- **THEN** the resulting default, data, and constraint remain correct without duplicate-object failure

### Requirement: Database documentation stays canonical
The canonical database documentation SHALL describe the `user` default, the `admin` and `user` value constraint, the handling of legacy values, and the requirement to deploy the migration independently to all configured tenant projects.

#### Scenario: Database contract is reviewed
- **WHEN** a maintainer consults `database.md` after implementation
- **THEN** its role table definitions and migration guidance match the deployed schema contract


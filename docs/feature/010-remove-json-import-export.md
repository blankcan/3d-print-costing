# Feature 010: Remove JSON Import/Export

## Objective

Remove JSON import/export completely from the product and backend API, remove legacy app-state import and migration support, and standardize the app on local SQLite persistence only.

This feature is a simplification and scope-reduction feature. It removes portable app-state behavior and keeps the app focused on its local database as the only supported persistence mechanism.

## Outcome

At the end of this feature, the app should:

- no longer expose JSON export or import in the UI
- no longer expose backend app-state import/export routes
- no longer support legacy v1 import/migration through app-state import
- use SQLite as the only supported persistence mechanism

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`

Feature 010 updates the current platform behavior by removing JSON import/export and legacy migration support while keeping all other app behavior intact.

## Scope

### In scope

- remove `Export JSON` and `Import JSON` UI actions
- remove frontend import/export handlers
- remove frontend import/export notifications and messages
- remove frontend service methods for app-state import/export
- remove backend `/api/app-state/export`
- remove backend `/api/app-state/import`
- remove backend app-state support code and legacy v1 import compatibility
- remove verification flows that depend on import/export
- update active/current docs to stop describing JSON import/export as supported

### Out of scope

- changes to costing formulas
- changes to pricing suggestion behavior
- changes to core job, filament, settings, catalog, customer, status, or image features
- changes to local database persistence behavior

## Removal Requirements

### Product UI removal

The product must no longer expose:

- `Export JSON`
- `Import JSON`

There should be no user-facing backup/restore workflow based on portable JSON app-state files after this feature.

### Frontend removal

Remove:

- header import/export actions
- import/export file handling
- import/export success and error messaging
- frontend API methods for app-state export/import

The frontend should stop referencing app-state portability as an active capability.

### Backend removal

Remove:

- `/api/app-state/export`
- `/api/app-state/import`

Remove backend support code that exists only to enable:

- portable app-state export
- portable app-state import
- legacy v1 import compatibility or migration through import

### Legacy migration removal

Feature 010 must also remove legacy v1 import and migration support that depends on the app-state import path.

The app should no longer claim to support migration through JSON app-state ingestion.

## Product Rules

The following rules are mandatory after this feature:

- SQLite is the only supported persistence mechanism
- no portable JSON backup/restore remains
- no legacy app-state import/migration path remains
- all non-import/export behavior remains unchanged

## Unchanged Behavior

Feature 010 must preserve:

- all costing formulas
- all pricing suggestion behavior
- all job behavior unrelated to JSON import/export
- filament behavior
- settings/defaults behavior
- catalog and customer behavior
- status/paid/delivered behavior
- image-related behavior
- local-first single-user workflow

This feature is a removal of import/export capability only, not a broader app redesign.

## Documentation Cleanup Requirements

Feature 010 must update active/current-platform docs so they no longer describe JSON import/export as supported behavior.

This includes, at minimum:

- `docs/architecture.md`

Historical docs may remain archival unless they require direct correction to avoid misleading current-platform expectations.

The feature should prioritize correcting current-facing platform documentation rather than rewriting every older planning artifact.

## Important Interfaces

### Backend/API removal

Remove:

- `/api/app-state/export`
- `/api/app-state/import`

The backend should no longer advertise or support portable app-state serialization or ingestion.

### Frontend removal

Remove:

- import/export header actions
- import/export service methods
- import/export notifications and messages
- file-based backup/restore UX

### Verification changes

Remove or replace verification steps that assert:

- JSON export works
- JSON import works
- legacy migration through import works

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- the UI no longer shows import/export actions
- the frontend no longer supports JSON backup/restore
- the backend no longer exposes app-state import/export routes
- legacy v1 import/migration through app-state import is removed

### Technical acceptance

- frontend import/export logic is removed
- backend app-state import/export logic is removed
- verification coverage no longer depends on import/export behavior
- active/current docs no longer describe JSON import/export as supported

### Product acceptance

- SQLite is the only supported persistence mechanism
- all remaining app features continue to behave as before

## Test Requirements

The implementing agent must verify all of the following:

1. Import/export actions are no longer present in the UI.
2. Frontend no longer references app-state import/export APIs.
3. Backend app-state import/export routes are removed or unavailable.
4. Legacy v1 import/migration through app-state import is removed.
5. All remaining workflows still work.
6. Local database persistence still works across restart.
7. Active/current platform docs no longer describe JSON import/export as supported.

## Constraints

- do not keep hidden or unofficial app-state import/export support
- do not leave the UI removed while preserving the feature as a supported backend capability
- do not change unrelated pricing or workflow behavior

## Deliverables

The implementing agent should deliver:

- removal of frontend JSON import/export UX
- removal of backend app-state import/export routes and support code
- removal of legacy import/migration support
- updated verification coverage
- updated current-facing docs reflecting SQLite-only persistence

## Definition Of Done

This feature is done when the repository no longer supports JSON import/export or legacy app-state migration, the current platform is documented as local-database-only, and all remaining workflows continue to function normally.

# Feature 006: Job Status And Fulfillment

## Objective

Add job-level workflow metadata so the app can track production progress and fulfillment state without affecting costing behavior.

This feature introduces:

- `status`
- `paid`
- `delivered`

These fields are informational job-management metadata only. They must not influence any costing calculations, pricing formulas, or suggestion logic.

## Outcome

At the end of this feature, the app should support:

- a workflow status per job
- a `paid` boolean per job
- a `delivered` boolean per job
- persistence of all three values across restart
- export/import support for all three values

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`

This feature extends the current v2 local platform job model and frontend workflow without changing pricing behavior.

## Scope

### In scope

- extend the SQLite jobs schema
- extend repository and service mappings
- extend job API payloads
- extend app-state export/import shape
- add frontend job editor support for the new fields
- add frontend display support where useful

### Out of scope

- costing formula changes
- pricing suggestion changes
- automation rules based on status
- notifications
- image upload

## Job Metadata Requirements

### Status field

Add a job status field with these allowed values:

- `PLANNING`
- `PRINTING`
- `COMPLETE`

This field represents the production stage of the job.

### Fulfillment booleans

Add two independent boolean fields:

- `paid`
- `delivered`

These fields represent fulfillment state and must remain independent from the status field.

Examples:

- a job may be `COMPLETE` but not `delivered`
- a job may be `PRINTING` and already `paid`
- a job may be `PLANNING` and unpaid

No enforced workflow dependency is required in this feature.

## Default Values

For newly created jobs, use these defaults:

- `status = PLANNING`
- `paid = false`
- `delivered = false`

These defaults should be applied at backend job creation time so the backend remains the source of truth.

## Product Rules

The following rules are mandatory:

- these fields are informational metadata only
- they must not affect costing calculations
- they must not alter markup suggestions
- they must not change totals, weights, or machine-cost allocation

## Data And API Requirements

### Job model extension

Add the following fields to the job model:

- `status: "PLANNING" | "PRINTING" | "COMPLETE"`
- `paid: boolean`
- `delivered: boolean`

### Persistence requirements

Update:

- SQLite jobs table
- job serializers
- repository create/read/update flows
- export/import app-state shape
- frontend job model expectations

### API behavior

Job API payloads should include:

- `status`
- `paid`
- `delivered`

No separate API resource is required. These fields should flow through the existing job endpoints.

### Export/import requirements

App-state export/import must preserve:

- `status`
- `paid`
- `delivered`

If importing older state that lacks these values, safe defaults should be applied.

## Frontend Requirements

### Job editor support

The frontend job editor must allow the user to:

- select a status
- toggle `paid`
- toggle `delivered`

The UI should make clear that these are job-management fields rather than costing inputs.

### Display support

The frontend should show these values in a practical place within the job workflow.

A compact summary display is acceptable, but the job editor must remain the primary place for editing them.

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- new jobs default to `PLANNING`, `paid = false`, and `delivered = false`
- users can update status
- users can update `paid`
- users can update `delivered`
- all three values persist across restart
- export/import preserves all three values

### Technical acceptance

- jobs table includes the required fields
- repository and serializer flows support the new fields
- existing job APIs include the new fields
- frontend job model supports the new fields cleanly

### Product acceptance

- costing outputs remain unchanged
- pricing suggestions remain unchanged
- the feature adds job-management metadata only

## Test Requirements

The implementing agent must verify all of the following:

1. New jobs default to `PLANNING`, `paid = false`, `delivered = false`.
2. Status changes persist across restart.
3. `paid` changes persist across restart.
4. `delivered` changes persist across restart.
5. Export/import preserves all three fields.
6. Costing outputs remain unchanged.
7. Pricing suggestion behavior remains unchanged.

## Constraints

- do not change costing logic
- do not introduce automation rules in this feature
- do not mix this feature with image upload
- do not create dependencies between `status`, `paid`, and `delivered` beyond basic storage and editing

## Deliverables

The implementing agent should deliver:

- updated jobs schema
- repository and serializer support for the new job metadata
- updated job API payloads
- export/import support
- frontend editing and display support for `status`, `paid`, and `delivered`

## Definition Of Done

This feature is done when the repository supports job workflow metadata for `status`, `paid`, and `delivered`, with safe defaults, persistence, export/import support, and no changes to any costing behavior.

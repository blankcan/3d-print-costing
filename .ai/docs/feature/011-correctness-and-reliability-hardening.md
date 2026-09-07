# Feature 011: Correctness And Reliability Hardening

## Objective

Improve data integrity, calculation reliability, editing behavior, and verification quality across the current system before further product expansion.

This is a cross-cutting architecture feature derived only from the independent review in:

- `docs/review/correctness-reliability-improvements-pass1.md`

It is not a new product workflow feature. It is a reliability and architecture hardening pass that may affect frontend behavior, backend validation, shared calculations, verification, and cleanup of duplicate or obsolete implementation paths.

## Outcome

At the end of this feature, the app should provide:

- reliable job autosave behavior during rapid editing
- server-side validation before persistence
- safe and consistent print-time normalization
- partial calculations that preserve useful valid-row output
- safer persistence and API behavior
- broader automated regression coverage
- clearer authoritative code paths in the repository

## Required Reading

The implementing agent must read and follow:

- `docs/review/correctness-reliability-improvements-pass1.md`

This feature is intentionally derived from the review findings rather than from any prior product-feature scope.

## Scope

### In scope

- reliable job autosave
- server-side input validation
- print-time normalization
- partial calculation behavior during invalid input
- persistence safety and API behavior
- automated regression tests
- legacy code cleanup

### Out of scope

- new product-facing catalog, pricing, workflow, or media features
- changing costing formulas for business reasons
- changing the app’s persistence model away from SQLite
- introducing unrelated architectural experiments not grounded in the review

## Architecture Intent

This feature must explicitly be treated as:

- architecture-focused
- correctness-focused
- reliability-focused
- behavior-preserving from a product perspective

It may touch:

- frontend
- backend
- shared logic
- verification
- docs

It must preserve current product capabilities while making them safer and more predictable.

## 1. Reliable Job Autosave

### Problem

Each field change currently sends the entire job to the backend immediately. Rapid edits can create overlapping requests, stale payloads, and out-of-order responses that overwrite newer user input.

### Required Outcome

- update visible job state immediately in the frontend
- debounce persistence so rapid changes are grouped into a single save
- ensure saves are processed in order, or ensure stale responses cannot replace newer state
- avoid refreshing the complete job list after every keystroke where possible
- expose a lightweight save state such as:
  - `Saving`
  - `Saved`
  - `Save failed`
- preserve unsaved edits when a save fails and allow a later retry

## 2. Server-Side Input Validation

### Problem

Validation is used for calculations, but repository methods can still persist invalid numeric or structural values received from API requests or imported JSON.

### Required Outcome

- validate filament, job, part, settings, and import payloads before persistence
- reject invalid requests with HTTP `400`
- return structured validation errors
- prevent persistence of:
  - `NaN`
  - infinite values
  - negative costs
  - negative time
  - invalid quantities
  - malformed records
- reuse shared validation rules where practical to avoid frontend/backend rule drift
- keep repository functions focused on persistence and do not rely on UI constraints for data integrity

## 3. Print-Time Normalization

### Problem

The minutes field accepts values above `59`, and splitting decimal hours can produce `60` minutes due to rounding.

### Required Outcome

- treat minutes as an integer in the range `0-59`
- apply matching constraints in both the UI and backend validation
- normalize stored decimal hours without ever returning `60` minutes
- convert through total minutes when splitting decimal hours into hours and minutes
- add explicit tests for boundary and rounding cases

## 4. Partial Calculation During Invalid Input

### Problem

A single invalid part row currently causes all job calculations and all valid rows to return zero values.

### Required Outcome

- validate each part row independently
- continue calculating valid rows while invalid rows contribute zero
- preserve row-level validation messages
- mark the overall job calculation as incomplete when any row or job-level field is invalid
- suppress or clearly qualify final selling-price suggestions until the complete job is valid
- do not make existing valid totals disappear merely because a new blank row was added

## 5. Persistence Safety And API Behavior

### Required Outcome

- return `404` when updating or deleting a job or filament that does not exist
- keep multi-table job saves transactional
- ensure failed writes cannot leave partially replaced jobs or parts
- avoid unnecessary delete-and-reinsert operations where a safer targeted update is practical
- retaining the existing transactional replacement approach is acceptable only if correctness is verified
- standardize API error responses with a stable shape

### Example error shape

```json
{
  "error": "Validation failed.",
  "validation": {
    "errors": [],
    "rowErrors": {}
  }
}
```

## 6. Automated Regression Tests

### Problem

The current worked-example check provides limited coverage and reports only a combined pass/fail result.

### Required Outcome

- introduce a proper automated test suite using the Node test runner or an appropriate lightweight framework
- run tests as part of `npm run verify`
- report individual failures clearly

### Minimum coverage

- material, waste, machine, total, markup, profit, and margin calculations
- multiple filament prices and quantities
- missing and deleted filament references
- negative, empty, non-numeric, infinite, and fractional inputs
- quantity whole-number enforcement at one or greater
- print-time boundaries including:
  - `0`
  - `59` minutes
  - `60` minutes
  - rounding near the next hour
- partial calculations with one invalid row
- backend validation and HTTP status codes
- import validation and rollback if import still exists at implementation time
- autosave ordering or stale-response protection

## 7. Legacy Code Cleanup

### Problem

The top-level `scripts/` implementation appears to overlap with the current React, Express, and shared implementation, making the authoritative code path unclear.

### Required Outcome

- confirm whether `scripts/` is still required
- remove obsolete files or move them into a clearly labelled archive
- ensure the README and verification scripts reference only the active implementation
- do not retain duplicate calculation or persistence logic without a documented reason

## Important Interfaces

This feature will likely touch:

- frontend job editing flow and save orchestration
- shared validation and calculation helpers
- backend request validation and repository boundaries
- API error response shape
- verification entrypoint via `npm run verify`

## Acceptance Criteria

The feature is complete when all of the following are true.

### Reliability acceptance

- rapid typing cannot roll a field back to an older value
- invalid API or import data cannot be persisted
- minutes are always represented as `0-59`
- valid rows retain useful calculations while another row is incomplete
- missing records return appropriate HTTP status codes
- imports and multi-table writes remain atomic where import still exists

### Verification acceptance

- `npm run verify` runs focused automated tests and the frontend production build
- tests report individual failures rather than a single combined pass/fail outcome

### Codebase acceptance

- only one authoritative implementation remains in the active source tree
- obsolete duplicate logic is removed or clearly archived

## Test Plan

The implementing agent must verify all of the following:

1. Rapid typing cannot roll a field back to an older value.
2. Invalid API/input data cannot be persisted.
3. Minutes always remain in `0-59`.
4. Valid rows continue to calculate while another row is invalid.
5. Missing records return proper `404` responses.
6. Multi-table writes remain atomic.
7. `npm run verify` runs focused automated tests plus the frontend build.
8. Only one authoritative implementation remains in the active source tree.

## Constraints

- do not turn this into a new product feature
- do not use this feature to introduce unrelated architectural changes
- do not weaken existing product capabilities while fixing reliability issues
- scope import-related hardening only to import capabilities that still exist at implementation time

## Deliverables

The implementing agent should deliver:

- safer autosave behavior
- backend validation before persistence
- corrected time normalization and validation
- partial-calculation support for valid rows
- standardized API error handling
- expanded automated tests
- cleanup of obsolete or duplicate active implementation paths

## Definition Of Done

This feature is done when the repository behaves predictably under rapid editing, rejects invalid persistence inputs, preserves useful partial calculations, standardizes core API reliability, expands automated regression coverage, and leaves a single clearly authoritative implementation path in the active source tree.

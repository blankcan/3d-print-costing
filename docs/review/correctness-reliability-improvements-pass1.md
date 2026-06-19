# Correctness and Reliability Improvements

## Purpose

Improve data integrity, calculation reliability, and editing behaviour before adding further product features.

This document is intentionally implementation-agnostic and should be used as input for generating a detailed feature specification.

---

## 1. Reliable Job Autosave

### Problem

Each field change currently sends the entire job to the backend immediately. Rapid edits can create overlapping requests, stale payloads, and out-of-order responses that overwrite newer user input.

### Required Outcome

- Update the visible job state immediately in the frontend.
- Debounce persistence so rapid changes are grouped into a single save.
- Ensure saves are processed in order, or ensure stale responses cannot replace newer state.
- Avoid refreshing the complete job list after every keystroke where possible.
- Expose a lightweight save state such as `Saving`, `Saved`, or `Save failed`.
- Preserve unsaved edits when a save fails and allow a later retry.

---

## 2. Server-Side Input Validation

### Problem

Validation is used for calculations, but repository methods can still persist invalid numeric or structural values received from API requests or imported JSON.

### Required Outcome

- Validate filament, job, part, settings, and import payloads before persistence.
- Reject invalid requests with HTTP `400` and structured validation errors.
- Prevent persistence of:
  - `NaN`
  - Infinite values
  - Negative costs
  - Negative time
  - Invalid quantities
  - Malformed records
- Reuse shared validation rules where practical to avoid frontend/backend rule drift.
- Keep repository functions focused on persistence and do not rely on UI constraints for data integrity.

---

## 3. Print-Time Normalisation

### Problem

The minutes field accepts values above 59, and splitting decimal hours can produce `60` minutes due to rounding.

### Required Outcome

- Treat minutes as an integer in the range `0-59`.
- Apply matching constraints in both the UI and backend validation.
- Normalise stored decimal hours without ever returning `60` minutes.
- Convert through total minutes when splitting decimal hours into hours and minutes.
- Add explicit tests for boundary and rounding cases.

---

## 4. Partial Calculation During Invalid Input

### Problem

A single invalid part row currently causes all job calculations and all valid rows to return zero values.

### Required Outcome

- Validate each part row independently.
- Continue calculating valid rows while invalid rows contribute zero.
- Preserve row-level validation messages.
- Mark the overall job calculation as incomplete when any row or job-level field is invalid.
- Suppress or clearly qualify final selling-price suggestions until the complete job is valid.
- Do not make existing valid totals disappear merely because a new blank row was added.

---

## 5. Persistence Safety and API Behaviour

### Required Outcome

- Return `404` when updating or deleting a job or filament that does not exist.
- Keep multi-table job saves transactional.
- Ensure failed writes cannot leave partially replaced jobs or parts.
- Avoid unnecessary delete-and-reinsert operations where a safer targeted update is practical; retaining the existing transactional replacement approach is acceptable if correctness is verified.
- Standardise API error responses with a stable shape.

Example:

```json
{
  "error": "Validation failed.",
  "validation": {
    "errors": [],
    "rowErrors": {}
  }
}
```

---

## 6. Automated Regression Tests

### Problem

The current worked-example check provides limited coverage and reports only a combined pass/fail result.

### Required Outcome

Introduce a proper automated test suite using the Node test runner or an appropriate lightweight framework.

### Minimum Coverage

- Material, waste, machine, total, markup, profit, and margin calculations.
- Multiple filament prices and quantities.
- Missing and deleted filament references.
- Negative, empty, non-numeric, infinite, and fractional inputs.
- Quantity must be a whole number of at least one.
- Print-time boundaries including:
  - 0
  - 59 minutes
  - 60 minutes
  - Rounding near the next hour
- Partial calculations with one invalid row.
- Backend validation and HTTP status codes.
- Import validation and rollback on failure.
- Autosave ordering or stale-response protection.

### Success Criteria

- Tests report individual failures.
- Tests run as part of `npm run verify`.

---

## 7. Legacy Code Cleanup

### Problem

The top-level `scripts/` implementation appears to overlap with the current React, Express, and shared implementation, making the authoritative code path unclear.

### Required Outcome

- Confirm whether `scripts/` is still required.
- Remove obsolete files or move them into a clearly labelled archive.
- Ensure the README and verification scripts reference only the active implementation.
- Do not retain duplicate calculation or persistence logic without a documented reason.

---

# Suggested Implementation Order

1. Add automated tests around current calculation and persistence behaviour.
2. Fix time validation and normalisation.
3. Add backend request and import validation.
4. Refactor frontend editing into immediate local state plus reliable debounced autosave.
5. Support partial calculations for valid rows.
6. Standardise API errors and missing-record responses.
7. Remove or archive obsolete implementation files.

---

# Definition of Done

- Rapid typing cannot roll a field back to an older value.
- Invalid API or import data cannot be persisted.
- Minutes are always represented as `0-59`.
- Valid rows retain useful calculations while another row is incomplete.
- Missing records return appropriate HTTP status codes.
- Imports and multi-table writes remain atomic.
- `npm run verify` runs focused automated tests and the frontend production build.
- Only one authoritative implementation remains in the active source tree.
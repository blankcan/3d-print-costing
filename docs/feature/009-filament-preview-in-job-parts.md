# Feature 009: Filament Preview In Job Parts

## Objective

Improve filament selection clarity inside job part rows by displaying the same core filament identity cues already used in the catalog:

- `name`
- `brand`
- `color`

This feature is a small frontend usability enhancement for the job editor. It is intended to help users distinguish between similarly named or similarly priced filaments more easily while preserving all current data and costing behavior.

## Outcome

At the end of this feature, the job editor should provide:

- richer filament identity inside dropdown options
- a compact selected-filament preview below the field after a filament is chosen
- unchanged costing and persistence behavior

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`

This feature builds on the current job editor and filament catalog behavior without changing backend models or pricing logic.

## Scope

### In scope

- improve filament option rendering in job part rows
- add a selected-filament preview below the field
- reuse filament identity fields already available in payloads
- preserve searchable filament selection behavior

### Out of scope

- filament schema changes
- job schema changes
- backend persistence changes
- pricing logic changes
- export/import changes

## Product Requirements

### Filament identity display

Part-row filament selection should display:

- `name`
- `brand`
- `color`

The treatment should mirror the identity cues already visible in the filament catalog so the job editor feels more consistent and easier to scan.

### Dropdown behavior

The dropdown option list should present richer labels that make it easier to distinguish between:

- similar names
- similar brands
- similar colors

The display should remain compact and readable.

### Selected preview behavior

After a filament is selected, the job part row should show a compact preview below the field.

This preview should reinforce the selected filament identity without requiring the user to reopen the dropdown.

## UI Requirements

### Suggested display

The recommended display structure is:

- primary line: filament `name`
- secondary line or compact supporting text: `brand • color`

### Missing-value handling

If `brand` or `color` is missing, the UI should degrade gracefully.

Acceptable behavior:

- show available values only
- use safe fallback text such as `Unspecified`

The implementation should avoid blank or confusing secondary labels.

### Search behavior

The filament selector must remain searchable.

This feature must not degrade the current find-and-select workflow.

## Boundaries

This feature must not:

- change filament data shape
- change job persistence shape
- change costing calculations
- change export/import behavior
- change the meaning of the selected filament on a part row

It is a rendering and job-editor UX improvement only.

## Technical Requirements

### Interfaces

No backend schema change is required.

No API change is required unless the frontend currently lacks fields that already exist in filament payloads.

Existing filament payloads already include:

- `name`
- `brand`
- `color`

The main implementation touchpoint should be the job editor’s filament-selection UI.

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- dropdown options show `name`, `brand`, and `color`
- selected filament preview appears after a filament is chosen
- preview handles missing `brand` or `color` cleanly
- searchable selection still works

### Technical acceptance

- no schema change is required
- no persistence behavior changes are introduced
- existing filament payload data is reused correctly

### Product acceptance

- changing filament still updates costing exactly as before
- no pricing behavior changes are introduced
- no export/import behavior changes are introduced

## Test Requirements

The implementing agent must verify all of the following:

1. Dropdown options show `name`, `brand`, and `color`.
2. Selected filament preview appears after a filament is chosen.
3. Preview handles missing `brand` or `color` cleanly.
4. Searchable behavior still works.
5. Changing filament still updates costing as before.
6. No pricing behavior changes are introduced.
7. No persistence behavior changes are introduced.

## Constraints

- keep this feature frontend-focused
- do not change filament persistence shape
- do not change job persistence shape
- do not alter costing logic

## Deliverables

The implementing agent should deliver:

- improved filament option rendering in job part rows
- a selected-filament preview below the filament field
- unchanged backend and pricing behavior

## Definition Of Done

This feature is done when the repository supports richer filament identity display in job part rows, including both improved dropdown labels and a compact selected preview, with no changes to persistence or costing behavior.

# Feature 003: Layout And Global Defaults

## Objective

Improve the usability of the v2 local platform by redesigning the current layout so it works better on wide screens and no longer feels horizontally compressed, even on large desktop displays.

This feature must also introduce app-level global defaults for:

- Machine Rate
- Waste %

These defaults must be managed through a settings menu, persisted by the backend, and applied to new jobs only.

This feature is a focused UX and platform enhancement for the existing React + Express + SQLite application. It must preserve all current costing formulas, validation rules, and product behavior from earlier features while improving layout quality and adding app-level defaults.

## Outcome

At the end of this feature, the app should provide:

- a more spacious two-pane workspace
- a top-right settings drawer
- backend-persisted global defaults for Machine Rate and Waste %
- automatic application of those defaults to newly created jobs
- unchanged costing behavior for all existing jobs and calculations

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`

`docs/architecture.md` remains the source of truth for the v2 app architecture. Feature 002 remains the source of truth for the broader platform behavior and stack choices. This feature adds a targeted UX and settings enhancement on top of that foundation.

## Scope

### In scope

- refactor the app shell layout
- replace the current cramped equal-column feel with a two-pane workspace
- move filament management into a secondary pane or rail
- keep job editor and results in the primary workspace
- add a header-level settings entry
- add a top-right settings drawer
- add backend-backed app settings persistence
- add global defaults for:
  - Machine Rate
  - Waste %
- extend bootstrap to include settings
- extend app-state export/import to include settings
- ensure new jobs inherit the saved defaults

### Out of scope

- changing costing formulas
- changing the markup pricing model
- retroactively updating existing jobs when defaults change
- multi-user or per-user preference handling
- adding new global defaults beyond Machine Rate and Waste % for this feature
- converting the app into a tabbed single-view workflow

## UX Decisions Locked For This Feature

The following UX decisions are already chosen and must be implemented accordingly:

- use a two-pane workspace
- use a top-right settings drawer
- apply global defaults to new jobs only

## Product Requirements

### 1. Layout Refresh

The current layout should be replaced with a structure that uses wide screens more effectively.

Target layout behavior:

- a left secondary rail for filament management and secondary tools
- a main workspace for active job editing and results
- job editor and results remain visible together on large screens
- the main workspace gets more visual priority than the catalog area
- the layout should feel stable and intentional on wide monitors rather than like three equal panels competing for space

The goal is to reduce the visual pressure currently caused by:

- the equal-weight multi-column layout
- dense form sections competing with summary content
- wide tables being constrained in a narrow third column

### 2. Responsive Behavior

The refreshed layout must behave cleanly across breakpoints.

Required behavior:

- large screens:
  - show the secondary rail plus the main workspace comfortably
  - keep results visible beside the job editor
- medium screens:
  - collapse or reduce the secondary rail before collapsing the main workspace
  - preserve usability of the job editor and results
- small screens:
  - stack sections cleanly
  - preserve access to the filament catalog
  - preserve access to settings

The responsive design should degrade intentionally rather than simply stacking everything at the same threshold used today.

### 3. Global Defaults Settings

Introduce app-level global defaults for:

- `defaultMachineRatePerHourZar`
- `defaultWasteFactorPercent`

These are app settings, not per-job fields.

They must be editable through a settings drawer accessible from the top-right area of the app header.

### 4. Defaults Application Rules

Defaults must behave as follows:

- saved defaults are applied automatically when creating a new job
- existing jobs keep their own stored Waste % and Machine Rate values
- changing the defaults does not retroactively modify existing jobs
- users may still edit Waste % and Machine Rate directly on any job after creation

This keeps saved jobs stable and avoids hidden changes to prior estimates.

## Data And API Requirements

### Settings model

At minimum, the new settings model must include:

- `defaultMachineRatePerHourZar`
- `defaultWasteFactorPercent`

These values should be represented clearly in API responses and the portable app-state shape.

### Persistence

Persist settings in the backend using `app_meta`.

This feature should not require a separate settings table unless the implementation reveals a concrete limitation with `app_meta`.

### Bootstrap behavior

The bootstrap payload must include settings so the frontend can:

- render the current defaults immediately
- populate the settings drawer
- create new jobs consistently using backend-backed defaults

### Export/import behavior

App-state export/import must be extended to include settings.

That means:

- export JSON must include the settings object
- import must restore settings along with filaments and jobs
- missing settings in older imports should fall back safely to defaults

### API requirements

Provide a settings API, preferably:

- `GET /api/settings`
- `PUT /api/settings`

The API must allow:

- reading current global defaults
- updating current global defaults

### Job creation behavior

When a new job is created:

- the backend must read the current persisted global defaults
- the new job must be seeded with those values
- if no defaults are set, the backend should fall back to `0`

The backend should remain the source of truth for how new jobs are initialized.

## Frontend Requirements

### App shell changes

Refactor the React app shell so it reflects distinct layout regions rather than three equal sibling panels.

Expected regions:

- header
- secondary rail
- main workspace
- results area within the main workspace

### Filament management placement

Filament Management should move into the left secondary rail or equivalent secondary pane.

Requirements:

- keep it accessible
- do not let it dominate the horizontal space
- ensure it remains usable if the list grows
- allow it to coexist with other future secondary tools if needed

### Settings drawer

Add a settings drawer that opens from a top-right header action.

The drawer must:

- show the current global defaults
- allow editing Waste % and Machine Rate defaults
- save through the backend
- provide clear confirmation or error feedback

### Main workspace

The job editor and results should remain the primary work area.

Requirements:

- preserve current job editing workflow
- preserve visibility of results on large screens
- give the job editor and results more usable width than they have now
- avoid overly narrow tables and compressed summary cards

## Non-Functional Requirements

- preserve existing costing math exactly
- preserve the current React + Express + SQLite architecture
- keep the UI desktop-first
- improve usability on ultrawide displays
- keep medium and small breakpoints intentional and stable
- do not introduce hidden data coupling between settings and already-saved jobs

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- the app uses a two-pane layout rather than the current cramped equal-column layout
- the settings drawer is accessible from the top-right header area
- the settings drawer supports saved defaults for Machine Rate and Waste %
- new jobs inherit the current saved defaults
- existing jobs do not change when defaults are updated
- settings persist across full app restart
- export/import includes settings

### Technical acceptance

- settings are persisted by the backend
- `app_meta` is used successfully for settings persistence unless a clearly justified alternative is required
- bootstrap includes settings
- a settings API exists for read/update
- job creation uses backend-side defaults seeding

### UX acceptance

- the layout no longer feels horizontally compressed on large screens
- job editor and results remain comfortable to use together on wide displays
- medium screens collapse secondary layout regions before harming the main workspace
- small screens remain usable and do not lose access to catalog or settings

## Test Requirements

The implementing agent must verify at minimum:

1. The layout feels meaningfully less compressed on large desktop widths.
2. New jobs inherit saved default Waste %.
3. New jobs inherit saved default Machine Rate.
4. Updating settings does not retroactively change existing jobs.
5. Settings persist after restart.
6. Export includes settings.
7. Import restores settings.
8. Existing costing outputs and worked-example totals remain unchanged.
9. Medium breakpoints remain usable.
10. Small-screen stacked behavior remains usable.

## Worked Behavior Expectations

Expected behavior example:

1. User opens Settings.
2. User saves:
   - Waste % = `10`
   - Machine Rate = `45`
3. User creates a new job.
4. The new job starts with:
   - Waste % = `10`
   - Machine Rate = `45`
5. User edits that job’s Machine Rate to `52`.
6. User later changes global defaults to:
   - Waste % = `12`
   - Machine Rate = `50`
7. The existing edited job remains unchanged.
8. The next newly created job starts with:
   - Waste % = `12`
   - Machine Rate = `50`

## Constraints

- do not change the costing model
- do not change the pricing suggestion model from markup to margin
- do not make settings live-linked to all jobs
- do not add more global defaults in this feature
- do not convert this feature into a broader architecture rewrite

## Deliverables

The implementing agent should deliver:

- updated frontend layout
- settings drawer UI
- backend-backed settings persistence
- settings API
- bootstrap/export/import updates for settings
- new-job initialization from saved defaults
- any minimal documentation updates needed to explain the new settings behavior

## Definition Of Done

This feature is done when the repository contains a less cramped, wide-screen-friendly v2 layout plus backend-persisted global defaults for Machine Rate and Waste %, with defaults applied to new jobs only and all existing costing behavior preserved.

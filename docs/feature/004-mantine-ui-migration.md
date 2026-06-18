# Feature 004: Mantine UI Migration

## Objective

Standardize the frontend on Mantine and migrate the existing React UI comprehensively to Mantine-based components, layout primitives, and theming.

This feature is a frontend modernization effort that builds on the existing React + Vite architecture and the behavior defined in Features 002 and 003. The goal is to replace the current hand-rolled UI primitives with a consistent component system while preserving all existing business logic, API interactions, pricing formulas, and workflow behavior.

This is a full migration feature, not a selective or incremental trial.

## Outcome

At the end of this feature, the app should provide:

- a Mantine-based frontend foundation
- a themed UI aligned to the app’s warm, business-focused visual direction
- consistent layout, form, button, panel, table, and overlay patterns
- preserved user workflows and calculation behavior
- minimal leftover custom CSS outside intentional theme or layout extensions

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`
- `docs/feature/003-layout-and-global-defaults.md`

Feature 004 assumes Feature 003 has already landed and is the new layout/settings baseline.

## Scope

### In scope

- install and configure Mantine in the frontend
- add Mantine providers and theme setup at the app root
- migrate the app shell to Mantine layout primitives
- migrate header actions and menus to Mantine components
- migrate the settings drawer to Mantine components
- migrate forms and inputs to Mantine components
- migrate buttons and action patterns to Mantine components
- migrate cards, panels, and grouped sections to Mantine components
- migrate tables and scrollable table containers to Mantine components where appropriate
- migrate notification and feedback messaging to Mantine patterns
- migrate modal or confirmation patterns if present or required during the conversion
- reduce or remove old custom CSS where Mantine takes over responsibility

### Out of scope

- backend data-model changes
- changes to pricing formulas
- changes to import/export semantics
- changes to settings/defaults behavior from Feature 003
- changing React + Vite to a different frontend runtime
- introducing a second long-term component system alongside Mantine

## Positioning

This feature should be treated as:

- a frontend-only architectural and UI foundation feature
- a full migration to Mantine
- a behavior-preserving refactor and visual-system upgrade

It must not be treated as a product-logic feature.

## Frontend Migration Requirements

Feature 004 must migrate the existing UI to Mantine for the following areas:

- app shell and layout primitives
- header actions and menus
- settings drawer
- forms and inputs
- buttons
- tables and scroll areas
- cards and panels
- notifications or feedback messages
- modal and confirmation patterns if present or needed

The migration should result in one clear UI system. Mantine becomes the default component and layout layer for the frontend.

## Theming And Design System

Mantine must be themed to fit the app rather than used with a generic default appearance.

The Mantine theme should include:

- a warm, business-focused visual direction consistent with the current app feel
- reusable spacing tokens
- reusable radius tokens
- custom color choices aligned to the existing product direction
- typography choices appropriate for a desktop-first business tool
- shared form styling expectations
- shared panel and surface styling expectations
- a responsive breakpoint strategy that supports the current app structure

The spec must explicitly avoid default “generic admin dashboard” styling. The migration should preserve the app’s more intentional tone while improving consistency and usability.

## Migration Boundaries

Feature 004 must:

- keep the existing React + Vite frontend architecture
- keep the existing Express + SQLite backend architecture
- keep backend APIs unchanged by default
- avoid changing calculation formulas
- avoid changing import/export behavior
- avoid altering the new-job/defaults semantics introduced by Feature 003
- avoid introducing a second UI library or hybrid design system as a long-term outcome

If a small UI-supporting API adjustment becomes necessary during implementation, it must be minimal and clearly justified.

## Technical Requirements

### Frontend root setup

The frontend should standardize on Mantine providers and theme setup at the app root.

At minimum, the migration should establish:

- Mantine provider configuration
- theme definition and shared tokens
- consistent app-level styling entry points

### CSS strategy

Existing custom CSS should be:

- minimized
- refactored
- or removed where Mantine replaces the need for it

Custom CSS should remain only where it provides intentional app-specific styling that is not better expressed through Mantine theme or component configuration.

### Component strategy

The migration should prefer:

- Mantine primitives for layout
- Mantine form components for input consistency
- Mantine surface components for panels and groupings
- Mantine overlay components for drawer/modal patterns
- Mantine feedback patterns for messaging and user confirmation

## Behavior Preservation Requirements

Feature 004 must preserve all existing workflows and logic, including:

- filament create/edit/delete
- job create/load/update/delete
- part row add/remove/edit
- settings/defaults behavior from Feature 003
- export/import behavior
- all pricing calculations and worked-example totals

This means the UI system may change, but the application behavior must remain the same.

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- all existing user workflows still work after the Mantine migration
- settings/defaults behavior from Feature 003 still works
- export/import still works
- worked costing examples still produce the same results

### Technical acceptance

- Mantine is the frontend component foundation
- Mantine providers and theme are configured at the app root
- existing custom CSS has been meaningfully reduced or refactored
- the frontend does not depend on two competing long-term UI systems
- backend APIs remain unchanged unless a minimal justified support change is required

### UX acceptance

- the app has a more consistent component system
- notifications, drawers, forms, buttons, and tables feel visually unified
- the Mantine-themed UI still fits the app’s warm, business-oriented direction
- the UI works cleanly on large, medium, and small screens
- no obvious visual regressions remain from partial CSS overlap

## Test Requirements

The implementing agent must verify all of the following:

1. Filament create/edit/delete still works.
2. Job create/load/update/delete still works.
3. Part row add/remove/edit still works.
4. Settings/defaults behavior from Feature 003 still works.
5. Export/import still works.
6. The worked costing example still produces the same totals.
7. Notifications and feedback messages remain usable.
8. Drawer behavior remains usable.
9. Tables and forms remain usable on large, medium, and small screens.
10. No major visual regressions remain from old CSS overlap.

## Constraints

- do not change business logic for the sake of the UI migration
- do not change calculation behavior
- do not change pricing semantics
- do not rewrite the backend unnecessarily
- do not leave the app in a long-term half-custom, half-Mantine state

## Deliverables

The implementing agent should deliver:

- a Mantine-based frontend setup
- app-wide Mantine theme configuration
- migrated UI components and layout
- reduced/refactored legacy CSS
- preserved behavior across all core workflows
- any minimal documentation updates needed for the new frontend UI foundation

## Definition Of Done

This feature is done when the repository contains a fully Mantine-based frontend migration that preserves all existing workflows and pricing behavior, aligns with the app’s intended visual direction, and provides a consistent long-term UI foundation for future features.

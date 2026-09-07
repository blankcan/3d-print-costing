Implement Feature 004 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\003-layout-and-global-defaults.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\004-mantine-ui-migration.md

Your job is to implement Feature 004 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app for South African Rand pricing.
- The app already exists as a React + Vite frontend with a Node.js + Express backend and SQLite persistence.
- Feature 003 is assumed to have landed first and is the layout/settings baseline for this work.
- Feature 004 is a frontend modernization and UI foundation feature, not a business-logic change.

Primary goals:
- Standardize the frontend on Mantine.
- Migrate the existing UI comprehensively to Mantine-based components.
- Replace current hand-rolled UI primitives with a consistent component system.
- Preserve all current backend behavior, API flows, pricing formulas, and workflow logic.
- Keep the app visually warm and business-focused rather than turning it into a generic admin dashboard.

Required constraints:
- Do not change any pricing formulas.
- Do not change the pricing suggestion model from markup to margin.
- Do not alter import/export behavior.
- Do not alter settings/defaults semantics from Feature 003.
- Do not rewrite the backend unnecessarily.
- Do not leave the app in a long-term hybrid state with two competing UI systems.

Implementation requirements:
- Install and configure Mantine in the frontend.
- Add Mantine providers and theme configuration at the app root.
- Create a custom Mantine theme aligned to the app’s visual direction.
- Migrate the frontend comprehensively to Mantine for:
  - app shell and layout primitives
  - header actions and menus
  - settings drawer
  - forms and inputs
  - buttons
  - tables and scroll areas
  - cards and panels
  - notifications or feedback messages
  - modal/confirmation patterns if present or needed
- Reduce, refactor, or remove old custom CSS where Mantine replaces the need for it.

Behavior preservation requirements:
- Filament create/edit/delete must still work.
- Job create/load/update/delete must still work.
- Part row add/remove/edit must still work.
- Settings/defaults behavior from Feature 003 must still work.
- Export/import must still work.
- Worked-example costing totals must remain unchanged.

Technical expectations:
- Keep React + Vite as the frontend architecture.
- Keep Express + SQLite as the backend architecture.
- Assume no backend API changes unless a very small UI-supporting change is truly necessary.
- Prefer Mantine primitives rather than rebuilding custom controls that duplicate Mantine capabilities.
- Keep custom CSS only where it adds intentional app-specific value that should not live in theme/config.

UX expectations:
- The resulting UI should feel more unified and polished.
- Themed Mantine components should still match the app’s warm, practical, desktop-first feel.
- The app should work cleanly on large, medium, and small screens.
- Avoid a generic “template” feel.

Testing and verification requirements:
- Verify:
  - filament create/edit/delete
  - job create/load/update/delete
  - part row add/remove/edit
  - settings/defaults behavior from Feature 003
  - export/import
  - notifications and feedback visibility
  - drawer behavior
  - responsive behavior on large, medium, and small screens
- Verify the worked costing example still produces the same results as before the migration.
- Verify there are no major visual regressions caused by old CSS overlap.

Execution expectations:
- Make the code changes directly in the repo.
- Implement the feature end to end, not just the provider setup or a partial restyle.
- After implementation, summarize:
  - what you changed
  - which files were created or updated
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver a full Mantine UI migration that becomes the long-term frontend foundation for this app while preserving all current workflows, settings behavior, and costing logic.

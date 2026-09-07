Implement Feature 003 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\003-layout-and-global-defaults.md

Your job is to implement Feature 003 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app for South African Rand pricing.
- The app already exists as a React + Vite frontend with a Node.js + Express backend and SQLite persistence.
- Feature 003 is a focused UX and settings enhancement, not a rewrite of the pricing logic or platform architecture.

Primary goals:
- Improve the layout so it uses wide screens better and no longer feels cramped.
- Replace the current equal-column feel with a two-pane workspace.
- Add backend-persisted global defaults for:
  - Machine Rate
  - Waste %
- Add a top-right settings drawer for managing those defaults.
- Apply defaults to new jobs only.
- Preserve all existing costing formulas and business behavior.

Required constraints:
- Do not change any costing formulas.
- Do not change the pricing suggestion model from markup to margin.
- Do not make settings retroactively change existing jobs.
- Do not make global defaults live-linked to all jobs.
- Do not add additional global defaults in this feature.
- Do not turn this into a multi-user or cloud feature.

Implementation requirements:
- Refactor the frontend app shell into a clearer layout with:
  - header
  - secondary rail or pane
  - main workspace
- Move Filament Management into the secondary rail/pane.
- Keep Job Editor and Results in the primary workspace.
- Ensure Results remain visible beside the Job Editor on large screens.
- Improve how medium and small breakpoints collapse so the app remains usable and intentional.

Settings requirements:
- Add a top-right settings action in the header.
- Implement a settings drawer UI.
- The drawer must support editing and saving:
  - defaultMachineRatePerHourZar
  - defaultWasteFactorPercent
- Save settings through the backend.
- Show understandable success and error feedback.

Backend and data requirements:
- Persist app-level settings through the backend.
- Use app_meta unless there is a concrete implementation reason not to.
- Extend bootstrap so it includes settings.
- Extend app-state export/import so it includes settings.
- Add settings API support, preferably:
  - GET /api/settings
  - PUT /api/settings
- Ensure new job creation uses backend-side settings defaults.
- If defaults are not set, fall back safely to 0.

Behavior requirements:
- New jobs inherit the saved defaults for Machine Rate and Waste %.
- Existing jobs keep their own stored values even after defaults are changed.
- Users can still edit Waste % and Machine Rate directly on each job after creation.
- Existing worked-example results and costing behavior must remain unchanged.

Frontend expectations:
- The refreshed layout should feel better on wide screens, especially large desktop and ultrawide displays.
- Medium screens should reduce or collapse the secondary pane before harming the core workspace.
- Small screens should stack cleanly without losing access to:
  - settings
  - filament management
  - job editing
  - results
- Avoid the current visual pressure caused by equal-width competing panels.

Testing and verification requirements:
- Verify the layout feels less compressed on large screens.
- Verify new jobs inherit saved default Waste %.
- Verify new jobs inherit saved default Machine Rate.
- Verify existing jobs do not change when settings are updated.
- Verify settings persist after restart.
- Verify export includes settings.
- Verify import restores settings.
- Verify costing formulas and worked-example outputs remain unchanged.
- Verify medium breakpoints remain usable.
- Verify small-screen stacked behavior remains usable.

Worked behavior expectation:
1. Save global defaults:
   - Waste % = 10
   - Machine Rate = 45
2. Create a new job.
3. Confirm the new job starts with:
   - Waste % = 10
   - Machine Rate = 45
4. Edit that job’s Machine Rate to 52.
5. Change global defaults to:
   - Waste % = 12
   - Machine Rate = 50
6. Confirm the edited job remains unchanged.
7. Create another new job.
8. Confirm the new job starts with:
   - Waste % = 12
   - Machine Rate = 50

Execution expectations:
- Make the code changes directly in the repo.
- Implement the feature end to end, not just the layout shell or only the backend settings support.
- Reuse and extend the existing architecture rather than inventing a new structure.
- After implementation, summarize:
  - what you changed
  - which files were created or updated
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver a completed Feature 003 implementation that makes the app feel better on wide screens, introduces backend-persisted global defaults for Machine Rate and Waste %, and preserves all existing costing behavior.

Implement Feature 002 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\001-initial-implementation.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md

Your job is to implement the v2 local platform exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This app is a local-first 3D printer costing tool for pricing jobs in South African Rand.
- V2 replaces the earlier browser-only architecture with a local full-stack app.
- The product behavior and costing formulas from Feature 001 must be preserved exactly.

Required stack:
- Frontend: React + Vite
- Backend: Node.js + Express
- Persistence: SQLite via better-sqlite3
- Package manager: npm
- Do not use webpack.
- Do not introduce a heavier full-stack framework unless absolutely required, which it should not be.

Primary goals:
- Build a working local full-stack app.
- Preserve all v1 costing logic and product defaults.
- Replace browser-only persistence with SQLite.
- Keep JSON export/import support.
- Support migration/import of legacy v1 app-state data.
- Keep the app single-user and local-first.

Implementation requirements:
- Scaffold the repo into the documented v2 structure.
- Create a React frontend with a practical single-page workflow.
- Create a Node/Express backend with a local API.
- Implement SQLite schema initialization and persistence.
- Implement backend-backed CRUD for:
  - filaments
  - jobs
  - job part rows
- Implement or expose:
  - /api/filaments
  - /api/jobs
  - /api/app-state/export
  - /api/app-state/import
  - optional /api/migrations/import-v1 if you choose that route
- Centralize canonical costing logic so the frontend does not drift from backend calculations.
- Preserve the existing formulas exactly:
  - baseWeightGrams = weightGramsPerPart * quantity
  - adjustedWeightGrams = baseWeightGrams * (1 + wasteFactorPercent / 100)
  - adjustedWeightKg = adjustedWeightGrams / 1000
  - materialCostZar = adjustedWeightKg * filament.costPerKgZar
  - machineCostZar = printTimeHours * machineRatePerHourZar
  - weightShare = adjustedWeightGrams / totalAdjustedWeightGrams
  - allocatedMachineCostZar = machineCostZar * weightShare
  - lineTotalCostZar = materialCostZar + allocatedMachineCostZar
  - costPerPartZar = lineTotalCostZar / quantity
  - grandTotalCostZar = totalMaterialCostZar + totalMachineCostZar
- Keep selling-price suggestions markup-based, from 10% to 100% in 10% increments.
- Keep saved filament selection as the default row pricing workflow.

Frontend requirements:
- Implement these main UI areas:
  - app header and persistence actions
  - filament catalog management
  - active costing job editor
  - cost breakdown and pricing results
- Support:
  - add/edit/delete filament
  - create/update/delete/load jobs
  - multiple part rows per job
  - quantity per row
  - hours/minutes time entry with normalized internal hours
  - results refresh after edits
  - export/import actions
- Keep the UI desktop-first, clean, readable, and still usable on smaller screens.
- Validation must remain stable during partial input and must not crash the UI.

Persistence and migration requirements:
- SQLite is the primary source of truth.
- Data must survive page refresh, backend restart, and full app restart.
- JSON export/import must remain supported.
- Support migration/import of legacy v1 app-state shape:
  - version
  - filaments
  - jobs
  - lastOpenJobId
- Preserve ids and timestamps where possible during migration.

Validation requirements:
- required filament selection on part rows
- quantity >= 1
- weight per part > 0
- filament cost per kg > 0
- machine rate >= 0
- waste factor >= 0
- time inputs >= 0
- invalid or partial input must not produce broken UI or corrupted persistence

Testing and verification requirements:
- Verify the worked example from Feature 001 and Feature 002 exactly.
- Verify:
  - filament CRUD persists in SQLite
  - job CRUD persists in SQLite
  - multiple part rows reload correctly after restart
  - waste factor calculations remain correct
  - machine cost allocation remains correct
  - export produces valid portable app-state JSON
  - import restores valid v2 state
  - at least one sample v1 state imports successfully into v2
- Add lightweight verification where practical for calculation logic and/or API behavior.

Important constraints:
- Do not change the pricing model from markup to margin.
- Do not redesign this into a cloud or multi-user app.
- Do not make the frontend the authority for persistence or canonical calculations.
- Do not swap out Vite for webpack.
- Do not ignore the architecture and feature documents.

Execution expectations:
- Make the code changes directly in the repo.
- Implement the app end to end, not just scaffolding.
- If a small local run/readme note is needed, add it.
- After implementation, summarize:
  - what you built
  - files and folders created or changed
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver a working v2 local platform in this repository that matches the documented architecture, preserves v1 costing behavior, uses npm + Vite + Node + Express + SQLite, and is ready for real local use.

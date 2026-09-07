# Feature 002: V2 Local Platform

## Objective

Migrate the application from a static vanilla JavaScript + `localStorage` implementation model to a local full-stack architecture using React + Vite, Node.js + Express, and SQLite via `better-sqlite3`.

This feature must preserve the costing behavior and product rules established in Feature 001 while upgrading the application to use proper local persistence and a more maintainable frontend/backend split.

## Outcome

At the end of this feature, the repo should contain a working local full-stack application with:

- a React frontend
- a Node.js + Express backend
- SQLite persistence using `better-sqlite3`
- durable storage for filaments, jobs, and part rows
- JSON export/import support
- legacy v1 data migration support
- equivalent costing outputs to the v1 feature specification

The delivered app should still be local-first and single-user.

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/001-initial-implementation.md`

`docs/architecture.md` is the v2 source of truth. Feature 001 remains the source of truth for the original product behavior and costing rules that must be preserved.

## Scope

### In scope

- scaffold a React + Vite frontend
- scaffold a Node.js + Express backend
- implement SQLite schema creation and initialization
- implement persistence through `better-sqlite3`
- implement filament CRUD
- implement job CRUD
- implement job part-row persistence
- rebuild the costing UI in React
- preserve all costing formulas and pricing behavior from v1
- implement JSON export/import
- support migration of legacy v1 exported data into the SQLite-backed model
- maintain local-first single-user operation

### Out of scope

- cloud sync
- user authentication
- multi-user support
- remote hosting
- customer management
- invoicing
- taxes and VAT workflows
- labor, electricity, packaging, shipping, or depreciation costing
- stock/inventory tracking
- PDF quote generation

## Technical Stack Decisions

Implement v2 with:

- React
- Vite
- Node.js
- Express
- `better-sqlite3`

Do not substitute a heavier frontend or full-stack framework unless the user later changes direction explicitly.

## Project Structure

The implementation should assume and build around a structure such as:

```text
/
|-- backend/
|   |-- src/
|   |   |-- server/
|   |   |-- routes/
|   |   |-- db/
|   |   `-- services/
|   `-- data/
|       `-- app.db
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- features/
|   |   |-- services/
|   |   `-- utils/
|   `-- public/
|-- shared/
|   `-- calculations/
|-- docs/
|   |-- architecture.md
|   `-- feature/
|       |-- 001-initial-implementation.md
|       `-- 002-v2-local-platform.md
```

The exact internal file split may vary slightly, but the separation between frontend, backend, and shared logic should remain clear.

## Product Requirements

### 1. Preserve V1 Behavior

All existing product rules from Feature 001 must remain intact:

- saved filament catalog
- multiple part rows in one job
- quantity per row
- waste factor per job
- print time normalization from hours/minutes
- machine hourly rate in Rand
- machine cost allocation by adjusted material-weight share
- markup-based selling-price suggestions from 10% to 100% in 10% increments

This feature is an architectural migration and platform upgrade, not a pricing-model change.

### 2. Filament Catalog

Implement backend-backed filament management that supports:

- create filament
- read/list filaments
- update filament
- delete filament

Each filament must support:

- id
- name
- material type
- brand
- color
- cost per kg in Rand
- optional notes
- created/updated timestamps

The React frontend must expose a practical filament management UI equivalent to the intent of v1.

### 3. Costing Jobs

Implement backend-backed costing jobs that support:

- create job
- read/list jobs
- fetch one job with part rows
- update job
- delete job
- load the active or recent job

Each job must support:

- job name
- waste factor percent
- print time in normalized hours
- machine rate per hour in Rand
- multiple part rows

Each part row must support:

- id
- job id
- part name
- filament selection
- weight grams per part
- quantity

### 4. Results And Breakdown

The UI must still present:

- total material cost
- total machine cost
- grand total cost
- total adjusted material weight

It must also show a row-level breakdown with:

- part name
- filament label
- quantity
- base weight
- adjusted weight
- material cost
- allocated machine cost
- line total cost
- cost per part

It must also show a selling-price suggestion table with:

- markup percentage
- suggested total selling price
- implied profit

## Calculation Requirements

The formulas from Feature 001 must be preserved exactly.

For each part row:

- `baseWeightGrams = weightGramsPerPart * quantity`
- `adjustedWeightGrams = baseWeightGrams * (1 + wasteFactorPercent / 100)`
- `adjustedWeightKg = adjustedWeightGrams / 1000`
- `materialCostZar = adjustedWeightKg * filament.costPerKgZar`

For the job:

- `printTimeHours = hours + (minutes / 60)` when normalizing UI input
- `machineCostZar = printTimeHours * machineRatePerHourZar`

Allocate machine cost by adjusted material weight:

- `weightShare = adjustedWeightGrams / totalAdjustedWeightGrams`
- `allocatedMachineCostZar = machineCostZar * weightShare`

For each part row:

- `lineTotalCostZar = materialCostZar + allocatedMachineCostZar`
- `costPerPartZar = lineTotalCostZar / quantity`

For the job:

- `totalMaterialCostZar = sum(line material costs)`
- `totalMachineCostZar = machineCostZar`
- `grandTotalCostZar = totalMaterialCostZar + totalMachineCostZar`

Generate markup suggestions for:

- 10%
- 20%
- 30%
- 40%
- 50%
- 60%
- 70%
- 80%
- 90%
- 100%

For each markup:

- `suggestedTotalPriceZar = grandTotalCostZar * (1 + markupPercent / 100)`
- `profitZar = suggestedTotalPriceZar - grandTotalCostZar`

### Canonical calculation rule

The backend must own the canonical costing logic, either directly or via shared pure modules used by the backend. The frontend must not carry a divergent implementation of the formulas.

## API Requirements

The implementation must provide API support around these resource groups:

- `/api/filaments`
- `/api/jobs`
- `/api/app-state/export`
- `/api/app-state/import`
- optional `/api/migrations/import-v1`

### Filament API behavior

Support:

- list all filaments
- create a filament
- update a filament
- delete a filament
- fetch one filament if needed

### Job API behavior

Support:

- list jobs
- create a job
- fetch one job with all part rows
- update a job and its rows
- delete a job
- load the active or most recent job

### App-state export/import

Support:

- exporting the complete portable app-state JSON
- importing a current v2 app-state JSON payload
- validating import payloads before persistence
- rejecting malformed imports with useful errors

### Legacy migration

Support one of these approaches:

- a dedicated migration endpoint for v1 imports
- a shared import flow that accepts both v1 and v2 export shapes

Whichever approach is chosen, the implementation must document it and make the workflow clear in the UI or developer notes.

## Database Requirements

### Minimum schema

Implement at least:

- `filaments`
- `jobs`
- `job_parts`

### Relationships

- each `job_parts` row belongs to one `jobs` row
- each `job_parts` row references one `filaments` row

### Initialization

The app must initialize the SQLite schema automatically if the database does not exist.

### Persistence behavior

Filaments, jobs, and part rows must survive:

- frontend refresh
- backend restart
- full app restart

## Migration Requirements

V2 must support migration from legacy v1 app state.

### Legacy input shape

Expect v1 imports to include:

- `version`
- `filaments`
- `jobs`
- `lastOpenJobId`

### Mapping rules

- v1 filaments map into `filaments`
- v1 jobs map into `jobs`
- nested v1 part rows map into `job_parts`
- ids should be preserved where possible
- timestamps should be preserved where available

### Migration behavior

The migration flow must:

- validate payload shape
- normalize missing optional fields safely
- reject malformed records clearly
- avoid silent partial imports

## Frontend Requirements

The React frontend must implement a single-page workflow with:

1. App header and persistence actions
2. Filament catalog management
3. Active costing job editor
4. Cost breakdown and pricing results

### Interaction requirements

- adding or editing filaments updates selection options
- changing job or row inputs refreshes results predictably
- users can add and remove part rows
- users can export and import app state
- users can recover prior persisted data on app restart

### Validation requirements

Carry forward the same validation rules from Feature 001:

- required filament selection on part rows
- quantity must be at least 1
- weight per part must be greater than 0
- filament cost per kg must be greater than 0
- machine rate must not be negative
- waste factor must not be negative
- time inputs must not be negative

The UI must remain stable and understandable during partial input or validation failures.

## Persistence Requirements

SQLite is the primary source of truth in v2.

JSON export/import remains required for:

- backup
- interchange
- migration

Browser-only persistence must not be the authoritative storage model anymore.

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- user can add, edit, and delete filaments through the React UI
- user can create, update, load, and delete jobs with multiple part rows
- each part row can select a saved filament
- totals calculate exactly according to Feature 001 formulas
- machine cost allocation follows adjusted-weight share
- markup suggestions from 10% to 100% are shown
- data persists in SQLite across restart
- user can export and import full app state
- user can migrate at least one sample v1 state into v2 successfully

### Technical acceptance

- frontend is implemented with React + Vite
- backend is implemented with Node.js + Express
- persistence is implemented with SQLite via `better-sqlite3`
- calculation logic has one canonical implementation path
- code structure clearly separates frontend, backend, and persistence concerns

### Usability acceptance

- the app remains practical for desktop use
- smaller-screen behavior remains acceptable
- validation prevents broken or nonsensical totals
- restart and reload behavior are reliable

## Test Requirements

The implementing agent must verify behavior manually and, where practical, with lightweight automated or scriptable checks.

Minimum scenarios to validate:

1. Filament CRUD persists correctly in SQLite.
2. Job CRUD persists correctly in SQLite.
3. A job with multiple part rows reloads with correct data after restart.
4. The v1 worked example still produces the same costing results.
5. Waste factor increases adjusted weight and material cost correctly.
6. Machine cost allocation changes correctly with different row weight shares.
7. JSON export produces a valid portable app-state file.
8. JSON import restores valid v2 state.
9. A sample v1 state imports successfully into the SQLite schema.
10. Invalid inputs do not produce broken UI or corrupted persistence behavior.

## Worked Example For Verification

Use the same worked example from Feature 001:

- Filament A cost: `R300/kg`
- Waste factor: `10%`
- Print time: `2 hours 30 minutes`
- Machine rate: `R40/hour`
- Part 1:
  - name: `Clip`
  - weight per part: `20g`
  - quantity: `2`
- Part 2:
  - name: `Bracket`
  - weight per part: `50g`
  - quantity: `1`

Expected values:

- Part 1 base weight: `40g`
- Part 1 adjusted weight: `44g`
- Part 1 material cost: `R13.20`
- Part 2 base weight: `50g`
- Part 2 adjusted weight: `55g`
- Part 2 material cost: `R16.50`
- Total adjusted weight: `99g`
- Print time hours: `2.5`
- Machine cost: `R100.00`
- Part 1 machine allocation: about `R44.44`
- Part 2 machine allocation: about `R55.56`
- Part 1 line total: about `R57.64`
- Part 2 line total: about `R72.06`
- Grand total: `R129.70`
- 10% selling price: `R142.67`
- 100% selling price: `R259.40`

Small display rounding differences are acceptable if the underlying math is correct.

## Constraints

- do not change the costing model from markup to margin
- do not remove saved filament selection as the default pricing workflow
- do not redesign the app into a multi-user cloud platform
- do not make the frontend the authority for persistence or canonical calculations

## Deliverables

The implementing agent should deliver:

- a React + Vite frontend
- a Node.js + Express backend
- SQLite schema and initialization
- backend-backed filament and job persistence
- canonical costing logic
- JSON export/import support
- legacy v1 migration support
- any minimal local run documentation needed for development and use

## Definition Of Done

This feature is done when the repository contains a working local v2 application that matches `docs/architecture.md`, preserves the business behavior defined in Feature 001, persists real data in SQLite, and is ready for local real-world use and future extension.

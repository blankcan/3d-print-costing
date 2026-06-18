# 3D Printer Costing App Architecture

## Overview

This document defines the v2 architecture for a local-first 3D printer costing application used to price print jobs in South African Rand (ZAR). The app is intended for a small shop or individual operator who needs stronger persistence and a more maintainable application structure than the original browser-only v1 design.

The application is now a local full-stack system:

- a React frontend for the user interface
- a Node.js + Express backend for application services and persistence
- a local SQLite database for durable storage

The app remains single-user and local-first. It is not designed as a hosted SaaS product or multi-user platform in v2.

The primary goals of v2 are:

- preserve the costing behavior and product rules established in v1
- replace browser-only persistence with SQLite
- provide a clearer separation between UI, business logic, and storage
- retain JSON import/export for backup and interoperability
- create a foundation that can support future local desktop packaging or later hosted expansion

## Product Scope

The product still centers on costing 3D print jobs with reusable filament pricing and multi-part job support.

The app supports:

- a reusable filament catalog
- one or more saved costing jobs
- multiple part rows per job
- a shared waste factor per job
- a shared machine-time input per job
- machine-cost allocation across part rows
- markup-based selling-price suggestions

V2 focuses on durability, maintainability, and future growth of the local app. It does not yet include:

- customer management
- invoicing
- tax or VAT workflows
- shipping or packaging costs
- labor or electricity costing
- stock/inventory control
- multi-user accounts
- cloud sync

## Runtime Architecture

### Frontend

The frontend is a React single-page application built with Vite.

Responsibilities:

- render the full costing workflow
- manage user interaction state
- call backend API endpoints
- display validation errors and calculated results
- support JSON import/export actions through the backend

### Backend

The backend is a Node.js application using Express.

Responsibilities:

- expose a local HTTP API to the frontend
- own the canonical persistence layer
- validate and normalize incoming data
- run or coordinate the canonical costing calculations
- provide import/export and migration support

### Database

The primary data store is a local SQLite database accessed through `better-sqlite3`.

Responsibilities:

- store filament catalog records
- store jobs
- store job part rows
- retain state across restarts

This architecture is designed for local use on a single machine. The backend and database are both local application components, not remote services.

## Chosen Stack

### Frontend stack

- React
- Vite
- browser fetch APIs

### Backend stack

- Node.js
- Express
- `better-sqlite3`

### Persistence model

- SQLite as the primary source of truth
- JSON import/export as backup and interchange

## Core Domains

### 1. Filament Catalog

The filament catalog stores reusable pricing records selected by part rows during costing.

Each filament entry contains:

- `id`: stable unique identifier
- `name`: short display label
- `materialType`: PLA, PETG, ABS, TPU, or free text
- `brand`: manufacturer or supplier name
- `color`: color description
- `costPerKgZar`: numeric cost per kilogram in Rand
- `notes`: optional free text
- `createdAt`: timestamp
- `updatedAt`: timestamp

The filament catalog remains the default source of truth for material pricing. Part rows reference saved filament records rather than duplicating price data inline.

### 2. Costing Job

A costing job is a single pricing scenario for one print run and includes shared machine and waste inputs plus multiple part rows.

Each job contains:

- `id`: stable unique identifier
- `jobName`: user-defined reference
- `wasteFactorPercent`: additional material percentage for waste, brims, purge, and setup overhead
- `printTimeHours`: normalized time in decimal hours
- `machineRatePerHourZar`: machine hourly rate in Rand
- `createdAt`: timestamp
- `updatedAt`: timestamp

### 3. Job Part Row

Each part row represents a line item within a job.

Each row contains:

- `id`: stable unique identifier
- `jobId`: owning job reference
- `filamentId`: saved filament reference
- `partName`: descriptive label
- `weightGramsPerPart`: grams per part
- `quantity`: quantity on the row
- `createdAt`: timestamp
- `updatedAt`: timestamp

Derived values remain calculated at runtime rather than stored as authoritative source fields.

### 4. Calculation Engine

The calculation engine transforms persisted job inputs into totals, part-row breakdowns, and selling-price suggestions.

Responsibilities:

- normalize time input
- compute row base and adjusted material weights
- compute row material costs
- compute total machine cost
- allocate machine cost across rows by adjusted material-weight share
- compute total job cost
- generate markup-based selling-price suggestions from 10% to 100%

The costing formulas are preserved exactly from v1. V2 changes the runtime architecture, not the product math.

## Data Model

### Logical entities

The minimum persisted entities for v2 are:

- `filaments`
- `jobs`
- `job_parts`

### Relationships

- each `job_parts` row belongs to exactly one `jobs` row
- each `job_parts` row references exactly one `filaments` row

### JSON/API shape examples

#### Filament record

```json
{
  "id": "fil_001",
  "name": "PLA Black Budget",
  "materialType": "PLA",
  "brand": "Generic",
  "color": "Black",
  "costPerKgZar": 289.99,
  "notes": "",
  "createdAt": "2026-06-18T10:00:00.000Z",
  "updatedAt": "2026-06-18T10:00:00.000Z"
}
```

#### Job record

```json
{
  "id": "job_001",
  "jobName": "Bracket Batch",
  "wasteFactorPercent": 12,
  "printTimeHours": 6.5,
  "machineRatePerHourZar": 45,
  "parts": [
    {
      "id": "part_001",
      "jobId": "job_001",
      "partName": "Left Bracket",
      "filamentId": "fil_001",
      "weightGramsPerPart": 35,
      "quantity": 4,
      "createdAt": "2026-06-18T10:05:00.000Z",
      "updatedAt": "2026-06-18T10:05:00.000Z"
    }
  ],
  "createdAt": "2026-06-18T10:05:00.000Z",
  "updatedAt": "2026-06-18T10:05:00.000Z"
}
```

#### Export/import app-state shape

```json
{
  "version": 2,
  "filaments": [],
  "jobs": [],
  "lastOpenJobId": null,
  "exportedAt": "2026-06-18T12:00:00.000Z"
}
```

### Units and conventions

- filament pricing is stored as Rand per kilogram
- part weight is stored as grams per part
- quantity is stored as a whole number greater than zero
- print time is normalized and stored as hours
- waste is stored as a percentage value such as `12` for 12%

## Calculation Rules

The v2 implementation must preserve these formulas exactly.

### Material weight

For each part row:

- `baseWeightGrams = weightGramsPerPart * quantity`
- `adjustedWeightGrams = baseWeightGrams * (1 + wasteFactorPercent / 100)`

### Filament cost

For each part row:

- `adjustedWeightKg = adjustedWeightGrams / 1000`
- `materialCostZar = adjustedWeightKg * filament.costPerKgZar`

### Machine cost

For the job:

- `machineCostZar = printTimeHours * machineRatePerHourZar`

### Machine cost allocation

For each part row:

- `weightShare = adjustedWeightGrams / totalAdjustedWeightGrams`
- `allocatedMachineCostZar = machineCostZar * weightShare`

If the total adjusted weight is zero, the app must avoid division by zero and treat row machine allocations as zero until valid inputs exist.

### Part row totals

For each part row:

- `lineTotalCostZar = materialCostZar + allocatedMachineCostZar`
- `costPerPartZar = lineTotalCostZar / quantity`

### Job totals

For the job:

- `totalMaterialCostZar = sum(materialCostZar for all rows)`
- `totalMachineCostZar = machineCostZar`
- `grandTotalCostZar = totalMaterialCostZar + totalMachineCostZar`

### Selling-price suggestions

For markup values from 10 to 100 in increments of 10:

- `suggestedTotalPriceZar = grandTotalCostZar * (1 + markupPercent / 100)`

The results must show:

- markup percentage
- suggested total price
- implied profit amount

## Backend and API Architecture

The backend is the application boundary between the React UI and persistent data.

### API resource groups

The v2 API should be organized around these resource groups:

- `/api/filaments`
- `/api/jobs`
- `/api/app-state/export`
- `/api/app-state/import`
- optional `/api/migrations/import-v1`

### High-level API behavior

#### Filaments

The filament endpoints should support:

- list filaments
- create filament
- update filament
- delete filament
- fetch a single filament if needed by the frontend

#### Jobs

The job endpoints should support:

- list jobs
- create job
- update job
- delete job
- fetch one job including its part rows
- load the active or most recent job for resume behavior

#### App-state export/import

The export/import endpoints should support:

- exporting the app’s portable JSON state
- importing a compatible JSON state file or payload
- validating the payload shape before persistence

#### Migration support

Migration may be handled in one of two ways:

- a dedicated endpoint such as `/api/migrations/import-v1`
- a compatible import flow where the app-state importer accepts legacy v1 export shape and maps it to v2 storage

The implementation should document which approach is chosen, but the architecture allows either.

### Response expectations

The API should return JSON responses with enough data for the frontend to render updated state without guessing. The docs do not require a rigid envelope format, but responses should be consistent across endpoints.

## Database Architecture

### Minimum schema

Document and implement at least these tables:

- `filaments`
- `jobs`
- `job_parts`

### Schema intent

#### `filaments`

Stores reusable material pricing records.

#### `jobs`

Stores job-level settings such as name, waste factor, normalized hours, and machine rate.

#### `job_parts`

Stores each part row associated with a job and filament reference.

### Initialization and migrations

The backend should initialize the SQLite schema if it does not exist.

If schema evolution is introduced, a lightweight migration mechanism should be used so the local database remains upgradable between versions.

## Frontend Architecture

The frontend is a React single-page application with a practical workflow-oriented UI.

### Main screens or sections

- app header and persistence actions
- filament catalog management
- active job editor
- cost breakdown and pricing results

### Frontend responsibilities

- fetch and mutate data through the API
- render dynamic part rows
- provide form validation feedback
- show calculation results returned from or aligned with the backend’s canonical math
- support import/export actions

### State model

The frontend should treat the backend as the source of truth for persisted records. Local component state is used for editing and interaction, but not as the final persistence authority.

## Shared Calculation Strategy

The costing formulas must remain centralized so frontend and backend do not drift.

Preferred approach:

- keep the canonical costing engine in a shared or backend-owned pure module
- either return calculated results from the backend or reuse the same pure logic in both layers through shared code

The important architectural rule is that there must be one authoritative implementation of the costing formulas.

## Proposed Project Structure

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

This structure is intended to separate frontend, backend, persistence, and optional shared business logic cleanly without overcomplicating the local app.

## Persistence Design

SQLite is now the default and primary persistence layer.

### Primary persistence

- filament records are stored in SQLite
- jobs are stored in SQLite
- part rows are stored in SQLite
- the active or most recent job can be restored from SQLite-backed state

### Backup and interchange

JSON export/import remains part of the system for:

- backup
- portability
- migration
- future interoperability with other tools

### Source-of-truth rule

`localStorage` is no longer the primary source of truth in v2. Any browser-side temporary storage is optional and must not replace the database-backed state.

## Legacy V1 Migration

V2 must support migration from the v1 export shape or equivalent local state.

### Legacy source shape

V1 data is expected to contain:

- `version`
- `filaments`
- `jobs`
- `lastOpenJobId`

### Mapping rules

- each v1 filament record maps directly into the `filaments` table
- each v1 job maps into the `jobs` table
- each job part entry inside a v1 job maps into a `job_parts` row with the job id attached
- `lastOpenJobId` can be retained as app metadata or used only during import flow depending on implementation

### Migration behavior

The migration flow must:

- validate legacy input
- normalize missing fields where safe
- preserve ids when possible
- preserve timestamps when available
- reject malformed payloads with clear errors

## Validation And Formatting

Validation rules from v1 still apply:

- required filament selection on part rows
- quantity must be at least 1
- weight per part must be greater than 0
- filament cost per kg must be greater than 0
- machine rate must not be negative
- waste factor must not be negative
- time inputs must not be negative

Formatting should still include:

- currency shown in South African Rand
- weights shown in grams
- percentages displayed consistently
- normalized handling of hours and minutes

## User Flow Summary

1. The user opens the React frontend.
2. The frontend loads filaments and the active or recent job from the local Express API.
3. The backend reads persisted records from SQLite.
4. The user updates filaments, job fields, and part rows in the UI.
5. The frontend sends mutations to the backend API.
6. The backend validates, persists, and calculates or coordinates canonical costing results.
7. The frontend renders updated totals, row breakdowns, and selling-price suggestions.
8. The user can export full app state as JSON or import legacy/current JSON back into the database-backed app.

## Assumptions And Constraints

- v2 remains a single-user local-first application
- React + Vite is the frontend stack
- Express is the backend framework
- `better-sqlite3` is the SQLite library
- markup suggestions remain markup-based, not margin-based
- machine cost is still distributed by adjusted material-weight share
- part rows still select saved filament records as the default workflow

## Non-Functional Considerations

### Durability

The primary reason for v2 is stronger persistence through SQLite and cleaner application boundaries.

### Maintainability

The codebase should keep UI, API, persistence, and calculation logic clearly separated.

### Local simplicity

Even with a backend, the app should remain easy to run on one machine with minimal setup.

### Responsiveness

The UI should remain desktop-first while still usable on smaller screens.

### Reliability

Import/export, schema initialization, and invalid input handling should fail clearly rather than silently.

## Future Extensions

The v2 local platform should support future evolution without a full rewrite.

Possible future extensions:

- desktop packaging such as Electron
- multiple machine profiles
- labor costing
- electricity costing
- packaging and shipping
- printer depreciation
- taxes and VAT support
- saved quotes and customer records
- PDF or printable quote output
- optional remote sync or hosted mode
- stock/inventory tracking

## Implementation Notes

This architecture is intended to guide the v2 rebuild. The next major implementation step is to scaffold the React frontend, Node/Express backend, SQLite schema initialization, and canonical calculation flow while preserving v1 costing behavior exactly.

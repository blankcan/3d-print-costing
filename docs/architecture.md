# 3D Print Costing Architecture

## Overview

This document describes the current architecture of the 3D Print Costing application as it is implemented today.

The platform is a local-first, single-user application for pricing 3D print jobs in South African Rand (ZAR). It is designed for a small workshop or solo operator who needs durable local storage, reusable catalog data, and fast costing workflows without depending on cloud services.

The application is implemented as:

- a React single-page frontend built with Vite
- a Mantine-based UI layer for layout, forms, tables, overlays, and theming
- a local Node.js + Express backend API
- a local SQLite database accessed through `better-sqlite3`
- shared calculation and validation helpers in `shared/calculations`

SQLite is the only supported source of truth for application data. JSON import/export and legacy migration flows are not part of the current platform.

## Product Capabilities

The current app supports:

- reusable filament catalog management
- reusable customer catalog management
- saved costing jobs with multiple part rows
- global defaults for Waste % and Machine Rate that apply to new jobs only
- per-job workflow status values:
  - `PLANNING`
  - `PRINTING`
  - `COMPLETE`
- per-job fulfillment flags:
  - `paid`
  - `delivered`
- optional customer assignment on jobs
- one primary image attachment per job
- material, machine, and total cost breakdowns
- markup-driven selling suggestions
- derived profit and margin output for each suggestion row

The current app does not depend on:

- cloud sync
- user accounts or authentication
- remote hosting for normal use
- browser-only persistence

## Runtime Architecture

### Frontend

The frontend is a React SPA served by Vite in development.

Primary frontend responsibilities:

- render the job costing workflow
- manage local editing state and autosave orchestration
- call backend endpoints for persisted data
- render validation feedback and derived costing output
- provide settings, catalog, and job-editing interactions

Mantine is the UI foundation for:

- app shell and layout primitives
- forms and inputs
- buttons and actions
- drawer navigation
- tables and scroll areas
- notifications and feedback

### Backend

The backend is an Express application running locally on the same machine as the frontend.

Primary backend responsibilities:

- expose the local HTTP API
- persist application data in SQLite
- serve stored job images
- return bootstrap data for app startup
- coordinate canonical calculation output using shared logic

### Database And Local File Storage

SQLite is the authoritative data store for structured records.

Local file storage is used for job images:

- one primary image may be attached to a job
- the backend stores the file on disk
- the database stores the image reference fields
- the backend serves the saved file through a local route

## Core Domains

### Filament Catalog

The filament catalog stores reusable material records used by job part rows.

Each filament record includes:

- `id`
- `name`
- `materialType`
- `brand`
- `color`
- `costPerKgZar`
- `notes`
- `createdAt`
- `updatedAt`

Filament records are selected by part rows rather than duplicating price data inline.

### Customer Catalog

The customer catalog stores optional customer details that can be linked to jobs.

Each customer record includes:

- `id`
- `name`
- `cellNumber`
- `email`
- `deliveryAddress`
- `createdAt`
- `updatedAt`

Customer assignment is informational only and does not affect calculations.

### Costing Jobs

A job is the main costing container for one pricing scenario.

Each job includes:

- `id`
- `jobName`
- `wasteFactorPercent`
- `printTimeHours`
- `machineRatePerHourZar`
- `status`
- `paid`
- `delivered`
- `customerId`
- `imagePath`
- `imageFileName`
- `createdAt`
- `updatedAt`

Job-level defaults are copied from saved settings only when a new job is created. Existing jobs keep their own saved values unless edited directly.

### Job Part Rows

Each job contains one or more part rows.

Each part row includes:

- `id`
- `jobId`
- `filamentId`
- `partName`
- `weightGramsPerPart`
- `quantity`
- `createdAt`
- `updatedAt`

Part rows reference saved filament records and contribute to the derived costing output.

### Settings

Application-level settings are persisted separately from jobs and catalogs.

The current settings model includes:

- `defaultWasteFactorPercent`
- `defaultMachineRatePerHourZar`

These defaults are used for new jobs only.

## Persistence Model

### Persisted Entities

The current persisted schema includes:

- `filaments`
- `customers`
- `jobs`
- `job_parts`
- `app_meta`

`app_meta` stores app-level settings and similar global values.

### Relationships

- each `job_parts` row belongs to one `jobs` row
- each `job_parts` row may reference one `filaments` row
- each `jobs` row may reference one `customers` row
- deleting a customer clears the job’s `customerId` via database relationship behavior
- deleting a filament clears the row’s `filamentId` via database relationship behavior

### Source Of Truth

The current platform uses SQLite as the only supported persistence layer.

This means:

- no JSON import/export support
- no localStorage-based source of truth
- no legacy v1 app-state import path

## Derived Calculation Output

Calculated results are not stored as authoritative persisted values. They are derived at runtime from saved job and catalog data.

Derived outputs include:

- base and adjusted material weight per row
- material cost per row
- allocated machine cost per row
- line total cost
- cost per part
- total material cost
- total machine cost
- grand total
- markup suggestions
- profit values
- margin percentages

This separation keeps persisted data small and keeps the costing engine authoritative for computed output.

## Calculation Rules

The current costing model is markup-based and uses shared calculation helpers in `shared/calculations`.

### Material And Weight

For each part row:

- `baseWeightGrams = weightGramsPerPart * quantity`
- `adjustedWeightGrams = baseWeightGrams * (1 + wasteFactorPercent / 100)`

### Material Cost

For each part row:

- `adjustedWeightKg = adjustedWeightGrams / 1000`
- `materialCostZar = adjustedWeightKg * filament.costPerKgZar`

### Machine Cost

For the job:

- `machineCostZar = printTimeHours * machineRatePerHourZar`

### Machine Cost Allocation

Machine cost is allocated across part rows using adjusted material-weight share.

For each part row:

- `weightShare = adjustedWeightGrams / totalAdjustedWeightGrams`
- `allocatedMachineCostZar = machineCostZar * weightShare`

### Totals

For each part row:

- `lineTotalCostZar = materialCostZar + allocatedMachineCostZar`
- `costPerPartZar = lineTotalCostZar / quantity`

For the job:

- `totalMaterialCostZar = sum(materialCostZar)`
- `totalMachineCostZar = machineCostZar`
- `grandTotalCostZar = totalMaterialCostZar + totalMachineCostZar`

### Selling Suggestions

Selling suggestions are generated at these markup levels:

- `10%` through `100%` in `10%` increments
- `125%`, `150%`, `175%`, `200%`, `225%`, `250%`

Each suggestion row includes:

- `markupPercent`
- `suggestedTotalPriceZar`
- `profitZar`
- `marginPercent`

Markup remains the pricing input model. Margin is informational output only.

## API Architecture

The backend exposes a local API boundary between the React frontend and the SQLite-backed data layer.

### Current Resource Groups

- `/api/bootstrap`
- `/api/settings`
- `/api/filaments`
- `/api/customers`
- `/api/jobs`
- `/api/job-images/*`

### API Responsibilities

#### `/api/bootstrap`

Returns the startup payload required by the frontend, including:

- settings
- customers
- filaments
- jobs
- active job
- calculations for the active job when one exists

#### `/api/settings`

Handles persisted global defaults for new jobs.

#### `/api/filaments`

Handles filament CRUD operations.

#### `/api/customers`

Handles customer CRUD operations.

#### `/api/jobs`

Handles:

- job creation
- job retrieval
- job updates
- job deletion
- active job loading
- job image attach/replace/remove flows

#### `/api/job-images/*`

Serves saved local image assets referenced by jobs.

## UI Architecture

The frontend is organized around a workflow-first layout rather than a generic admin dashboard.

### App Shell

The top-level UI includes:

- app header
- new job action
- settings access
- main workspace

### Main Workspace

The primary workspace focuses on:

- active job editing
- part-row management
- results and pricing output

On larger screens, job editing and results remain visible together.

### Settings Drawer

Settings are accessed through a right-side drawer that acts as a small internal menu.

The drawer currently has two sections:

- `Defaults`
- `Catalog`

#### Defaults

Contains the global settings for:

- default Waste %
- default Machine Rate / Hour

These defaults affect new jobs only.

#### Catalog

Contains the reusable management views for:

- Filaments
- Customers

Filament management is no longer part of the main job page.

### Job Editor

The job editor supports:

- job name editing
- job status changes
- customer selection
- waste and machine-rate editing
- print-time hour/minute input
- fulfillment flags
- image upload, replace, preview, and removal
- dynamic part rows

Filament selection in part rows uses richer identity cues:

- primary label: filament name
- secondary identity: brand and color

## Validation, Normalization, And Reliability Notes

Shared helpers in `shared/calculations` centralize:

- number coercion
- time normalization
- status normalization
- validation of settings, filaments, customers, jobs, and parts
- canonical costing calculations

The frontend currently includes autosave orchestration and save-state feedback during job editing. That behavior is part of the live implementation, but this document describes it at a high level rather than as a detailed product contract.

The main verification entrypoint is:

- `npm run verify`

At the root level, this runs:

- backend verification
- frontend production build

## Project Structure

```text
/
|-- backend/
|   |-- data/
|   |-- scripts/
|   `-- src/
|       |-- db/
|       |-- routes/
|       |-- server/
|       `-- services/
|-- docs/
|   |-- architecture.md
|   |-- feature/
|   |-- prompts/
|   `-- review/
|-- frontend/
|   `-- src/
|       |-- components/
|       |-- services/
|       `-- utils/
|-- shared/
|   `-- calculations/
`-- README.md
```

## User Flow Summary

1. The frontend loads bootstrap data from the local backend.
2. The backend reads settings, catalog data, jobs, and active-job context from SQLite.
3. The user edits the active job in the React UI.
4. The frontend persists job changes through the backend API.
5. Shared calculation logic produces derived costing output.
6. The frontend renders updated totals, results, and selling suggestions.
7. Settings, catalog records, job metadata, and image references persist locally across restarts.

## Non-Functional Characteristics

### Local-First Operation

The app is intended to work on one machine without external services.

### Single-User Simplicity

There is no user account system or multi-user concurrency model in the current platform.

### Durable Local Persistence

SQLite provides durable structured storage, while the backend manages local image files.

### Maintainability

The current architecture separates:

- UI behavior
- API behavior
- persistence
- shared calculations and validation

## Current Boundaries

The platform currently does not aim to provide:

- cloud sync
- hosted SaaS deployment by default
- authentication or roles
- invoicing
- tax/VAT workflows
- stock control
- labor or electricity costing
- shipping logic
- multiple images per job

## Documentation Status

This document is the current architecture source of truth for the live platform.

Feature docs in `docs/feature/` and implementation prompts in `docs/prompts/` remain useful as planning history, but they should not be treated as more current than this architecture document.

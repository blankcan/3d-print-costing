# 3D Print Costing

Local-first 3D print costing software for pricing print jobs in South African Rand.

## Overview

This project is a single-user local application for:

- managing reusable filament records
- managing reusable customer records
- creating and updating saved print-costing jobs
- attaching one primary image to a job
- tracking job workflow status, payment, and delivery
- calculating material, machine, and total costs
- generating markup-based selling suggestions with profit and margin output

The app is designed to run locally on one machine. It does not require cloud sync, user accounts, or remote hosting for normal use.

## Current Stack

- Frontend: React + Vite
- UI: Mantine
- Backend: Node.js + Express
- Persistence: SQLite via `better-sqlite3`
- Shared logic: calculation, normalization, and validation helpers in `shared/calculations`

## Current Product Shape

The current platform includes:

- a main job-costing workspace
- reusable filament and customer catalogs
- global defaults for new jobs:
  - Waste %
  - Machine Rate / Hour
- job status values:
  - `PLANNING`
  - `PRINTING`
  - `COMPLETE`
- fulfillment flags:
  - `paid`
  - `delivered`
- optional customer assignment on jobs
- one image per job
- markup suggestions from `10%` to `250%`
- suggestion output with suggested price, profit, and margin

## Repository Structure

```text
.
|-- backend/
|-- docs/
|-- frontend/
|-- shared/
|-- package.json
`-- README.md
```

## Prerequisites

- Node.js
- npm

## Getting Started

Install dependencies from the repo root:

```bash
npm install
```

The root `postinstall` script installs both frontend and backend dependencies.

Start the app in development mode:

```bash
npm run dev
```

Development URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Useful Scripts

Run frontend and backend together:

```bash
npm run dev
```

Run only the backend:

```bash
npm run dev:backend
```

Run only the frontend:

```bash
npm run dev:frontend
```

Build the frontend:

```bash
npm run build
```

Run verification:

```bash
npm run verify
```

This runs:

- the backend verification script
- a frontend production build

## Data And Persistence

- Structured app data is stored locally in SQLite under `backend/data/`
- Primary job images are stored locally by the backend and referenced from the database
- SQLite is the only supported source of truth
- JSON import/export is not supported

## Architecture And Docs

Current documentation lives under `docs/`:

- `docs/architecture.md`
- `docs/feature/`
- `docs/prompts/`
- `docs/review/`

`docs/architecture.md` is the current architecture source of truth for the live app.

The feature and prompt docs are mostly planning and implementation-history artifacts for follow-on work.

## Product Boundaries

The current app is:

- local-first
- single-user
- offline-friendly within the limits of a local web app

The current app does not provide:

- cloud sync
- auth
- multi-user collaboration
- remote hosting requirements for normal use

## Git Remote

Repository URL:

- [blankcan/3d-print-costing](https://github.com/blankcan/3d-print-costing.git)

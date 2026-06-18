# 3D Print Costing

Local-first 3D printer costing app for pricing print jobs in South African Rand.

## Overview

This project is a full-stack local application for:

- managing reusable filament pricing
- creating and editing print-costing jobs
- calculating material, machine, and total job cost
- generating selling-price suggestions from markup rules
- exporting and importing app state as JSON

The app is designed for single-user local use and keeps its primary data in SQLite.

## Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Persistence: SQLite via `better-sqlite3`
- Shared logic: centralized calculation helpers in `shared/calculations`

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

This root install also installs the backend and frontend packages through the root `postinstall` script.

Start the app in development mode:

```bash
npm run dev
```

Development URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

## Useful Scripts

Run both frontend and backend:

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

Verify the current implementation:

```bash
npm run verify
```

This runs the backend verification script and a frontend production build.

## Data And Persistence

- App data is stored locally in SQLite under `backend/data/`
- JSON export/import is supported through the app
- Database files are ignored by Git

## Documentation

Project planning and feature specs live under `docs/`, including:

- architecture notes
- implementation feature specs
- implementation prompts for follow-on agent work

## Git Remote

Repository URL:

- [blankcan/3d-print-costing](https://github.com/blankcan/3d-print-costing.git)

# Feature 001: Initial V1 Implementation

## Objective

Implement the first working version of the 3D Printer Costing web application described in `docs/architecture.md`.

This feature should deliver a complete, usable, browser-based v1 that runs locally as a static single-page app with no backend. The implementation must include filament catalog management, multi-part costing, local persistence, JSON import/export, full cost breakdowns, and markup-based selling-price suggestions.

The goal is for a user to open the app, create filament definitions, build a costing job with multiple part rows, and immediately see accurate costing outputs in South African Rand.

## Outcome

At the end of this feature, the repo should contain a functioning v1 app with:

- a working single-page UI
- modular JavaScript code
- persistent local state using `localStorage`
- JSON export/import support
- correct cost calculations for multi-part print jobs
- responsive layout usable on desktop and acceptable on mobile

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`

That document is the source of truth for architecture, data model, and default product decisions.

## Scope

### In scope

- initial static app scaffold
- HTML, CSS, and vanilla JavaScript implementation
- filament catalog create/edit/delete flow
- costing job entry and editing
- multiple part rows per job
- quantity per part row
- waste factor handling
- print time entry and normalization
- machine rate costing
- total material, machine, and grand total cost calculation
- machine cost allocation by adjusted material-weight share
- selling-price suggestions from 10% to 100% markup in 10% increments
- local persistence
- JSON export/import
- client-side validation
- clear results breakdown

### Out of scope

- backend APIs
- SQLite or any external database
- user authentication
- customer management
- quote PDF generation
- taxes, VAT, shipping, packaging, labor, electricity, and depreciation fields
- inventory stock tracking
- multi-user collaboration

## Technical Requirements

### Stack

Implement as:

- `index.html`
- `styles/main.css`
- `scripts/app.js`
- `scripts/state.js`
- `scripts/persistence.js`
- `scripts/calculations.js`
- `scripts/ui.js`

Use plain browser APIs only. Do not introduce a frontend framework for v1.

### Project structure

Create the following initial structure if it does not exist:

```text
/
|-- docs/
|   |-- architecture.md
|   `-- feature/
|       `-- 001-initial-implementation.md
|-- scripts/
|   |-- app.js
|   |-- state.js
|   |-- persistence.js
|   |-- calculations.js
|   `-- ui.js
|-- styles/
|   `-- main.css
`-- index.html
```

### Browser compatibility

Target current evergreen desktop browsers first. The app should also behave reasonably in mobile browsers.

### Data persistence

Persist data in `localStorage` using a versioned top-level object.

The storage shape must support:

- `version`
- `filaments`
- `jobs`
- `lastOpenJobId`

### No backend

The app must be fully usable by opening the static app locally or serving it from a basic static web server.

## Product Requirements

### 1. Filament Catalog

Implement a filament management area that allows the user to:

- add a filament record
- edit a filament record
- delete a filament record
- view saved filament records

Each filament record must support:

- name
- material type
- brand
- color
- cost per kg in Rand
- optional notes

Each record must also have an internal unique id and timestamps.

The filament catalog is reusable across jobs.

### 2. Costing Job Builder

Implement one primary job builder view for the active costing job.

The user must be able to enter:

- job name
- waste factor percent
- print time hours
- print time minutes
- machine rate per hour in Rand

The user must be able to add and remove part rows dynamically.

Each part row must allow:

- part name
- filament selection from saved filament records
- weight in grams per part
- quantity

There must be support for multiple part rows in a single job.

### 3. Calculation Rules

Implement the calculation logic exactly as follows.

For each part row:

- `baseWeightGrams = weightGramsPerPart * quantity`
- `adjustedWeightGrams = baseWeightGrams * (1 + wasteFactorPercent / 100)`
- `adjustedWeightKg = adjustedWeightGrams / 1000`
- `materialCostZar = adjustedWeightKg * filament.costPerKgZar`

For the job:

- normalize time using hours plus minutes
- `printTimeHours = hours + (minutes / 60)`
- `machineCostZar = printTimeHours * machineRatePerHourZar`

Allocate machine cost across rows by adjusted weight:

- `weightShare = adjustedWeightGrams / totalAdjustedWeightGrams`
- `allocatedMachineCostZar = machineCostZar * weightShare`

For each part row:

- `lineTotalCostZar = materialCostZar + allocatedMachineCostZar`
- `costPerPartZar = lineTotalCostZar / quantity`

For the job:

- `totalMaterialCostZar = sum(line material costs)`
- `totalMachineCostZar = machineCostZar`
- `grandTotalCostZar = totalMaterialCostZar + totalMachineCostZar`

Generate suggested selling prices using markup, not margin:

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

### 4. Results And Breakdown

The app must present a clear costing breakdown including:

- total material cost
- total machine cost
- grand total cost
- total adjusted material weight

It must also show a line-by-line part breakdown including:

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

### 5. Persistence And Data Handling

Implement local persistence so that:

- saved filaments remain after page refresh
- saved jobs remain after page refresh
- the current or last-open job can be restored on load

Implement JSON export and import:

- export the full persisted app state as JSON
- import a compatible JSON file back into the app
- validate the imported data shape before accepting it
- show an understandable error if import fails

For v1, import may replace current state rather than merge it.

### 6. Validation

Add client-side validation for:

- required filament selection on part rows
- quantity must be at least 1
- weight per part must be greater than 0
- filament cost per kg must be greater than 0
- machine rate must not be negative
- waste factor must not be negative
- time inputs must not be negative

The app should avoid misleading calculations when data is incomplete.

If the user has entered incomplete values, either:

- show validation messages, or
- suppress final calculated outputs until valid

The UI must never crash on partial input.

## UX Requirements

### General

- design for clear local business use rather than generic demo styling
- prioritize readability and speed of entry
- desktop-first layout
- mobile-friendly responsive behavior

### Suggested layout

Implement a single-page layout with these sections:

1. App header and persistence actions
2. Filament catalog management
3. Current costing job editor
4. Cost breakdown and pricing results

### Interaction expectations

- adding a filament should update part-row dropdown options
- editing or deleting a filament should keep the UI state consistent
- adding/removing part rows should update calculations immediately or on next render
- cost results should refresh after relevant inputs change
- export/import actions should be easy to find

### Formatting

- show currency in South African Rand
- show grams clearly
- show percentages clearly
- use reasonable rounding for displayed values
- keep internal math precise enough to avoid obvious rounding errors

## Implementation Guidance

### Module responsibilities

#### `scripts/state.js`

Implement:

- default app state factory
- id generation helpers
- object factory helpers for filament, job, and part rows
- state update helpers

#### `scripts/persistence.js`

Implement:

- load state from `localStorage`
- save state to `localStorage`
- storage key constants
- version checks
- JSON export helper
- JSON import helper with validation

#### `scripts/calculations.js`

Implement pure functions for:

- time normalization
- per-row weight calculations
- per-row material cost calculations
- machine cost calculations
- machine cost allocation
- total summaries
- markup suggestion generation

Keep this module independent from the DOM.

#### `scripts/ui.js`

Implement:

- DOM rendering for catalog, job form, part rows, and results
- event binding
- input parsing
- validation presentation
- empty states

#### `scripts/app.js`

Implement:

- app bootstrap
- initial state load
- UI initialization
- rerender flow
- persistence triggers

### Rendering model

A simple rerender-on-change approach is acceptable for v1.

The code does not need a framework-style reactive system. It does need to stay understandable and stable as the feature set grows.

### Styling

Create a polished but simple UI in `styles/main.css`.

Requirements:

- visually distinct sections
- clear tables or card blocks
- responsive stacking on narrow screens
- form controls sized for practical use
- results area visually separated from editing inputs

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- user can add, edit, and delete filaments
- user can create a costing job with multiple part rows
- each row can select a saved filament
- totals calculate correctly
- machine cost allocation follows adjusted-weight share
- markup suggestions from 10% to 100% are shown
- state persists after refresh
- user can export and import JSON state

### Technical acceptance

- app is implemented with plain HTML, CSS, and JavaScript
- calculation logic is modular and separated from UI logic
- no backend is required
- code structure matches the planned module split

### Usability acceptance

- the page is readable and usable on desktop
- the app remains functional on smaller screens
- validation prevents broken or nonsensical totals
- empty states and partial-input states are handled gracefully

## Test Requirements

The implementing agent must verify behavior manually and, where practical, with lightweight testable calculation checks.

Minimum scenarios to validate:

1. Single filament, single part row, simple machine cost.
2. Multiple part rows using the same filament.
3. Multiple part rows using different filaments.
4. Waste factor increases adjusted weight and material cost correctly.
5. Quantity changes cost-per-part correctly.
6. Machine cost allocation changes correctly when one part row has a larger adjusted weight share.
7. JSON export produces valid app data.
8. JSON import restores state.
9. Refreshing the page retains saved data.
10. Invalid or missing numeric fields do not produce broken UI behavior.

Use at least one worked example with hand-checkable values during verification.

## Worked Example For Verification

Use this example to verify the calculations:

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

- do not add a framework unless there is a very strong reason
- do not introduce a backend
- do not change the pricing model from markup to margin
- do not replace saved filament selection with manual per-row costing as the default model

## Deliverables

The implementing agent should deliver:

- all initial app files and folders
- functioning v1 UI
- completed costing engine
- persistence layer
- JSON import/export support
- any small supporting documentation needed to run the app locally

## Definition Of Done

This feature is done when the repository contains a usable v1 static web app that matches `docs/architecture.md`, satisfies the acceptance criteria in this document, and is ready for a user to begin entering real filament and job data immediately.

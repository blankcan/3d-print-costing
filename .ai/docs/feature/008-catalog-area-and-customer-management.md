# Feature 008: Catalog Area And Customer Management

## Objective

Restructure the Settings drawer so it acts like a menu with two top-level options:

- `Defaults`
- `Catalog`

Move Filament Management out of the main app page and into the dedicated Catalog section, which should support both Filaments and Customers.

This feature also adds customer management and allows jobs to reference an optional customer.

Feature 008 remains one combined feature because:

- filament management relocation
- catalog navigation
- and customer management

are tightly coupled in the current app structure.

## Outcome

At the end of this feature, the app should provide:

- a Settings drawer with two top-level options:
  - Defaults
  - Catalog
- a dedicated Catalog area under Settings
- separate Filaments and Customers pages or tabs within Catalog
- customer CRUD support
- optional customer selection on jobs
- removal of Filament Management from the main page

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`

This feature extends the v2 local platform and reorganizes the catalog experience without changing pricing behavior.

## Scope

### In scope

- restructure the Settings drawer into a two-option menu
- keep Defaults as its own dedicated page within Settings
- move filament management into a dedicated Catalog area
- add Customers to the Catalog area
- create separate Filaments and Customers pages or tabs under Catalog
- add customer CRUD support
- add optional job-to-customer association
- update schema, API payloads, export/import, and frontend structure

### Out of scope

- billing
- CRM features
- costing or pricing changes
- automation rules
- splitting this into separate catalog and customer features

## Catalog Requirements

### Catalog location

Catalog should live under Settings as one of the two top-level destinations in the Settings drawer.

It should not remain part of the main costing workspace.

### Settings menu structure

The Settings drawer should act like a small internal menu with two options:

- `Defaults`
- `Catalog`

Each option should render its own dedicated page or view inside the drawer.

`Defaults` should contain the existing global defaults management already introduced by prior work.

`Catalog` should contain the entity-management area for:

- Filaments
- Customers

### Catalog organization

Catalog should contain separate Filaments and Customers pages or tabs inside the Catalog view.

The exact UI shape may be:

- tabs
- sub-pages
- or an equivalent settings-subsection navigation

but the result must clearly separate the two catalog entity types.

### Filaments

Existing filament management behavior should be preserved, but moved into the new Catalog structure.

Filaments must no longer be managed directly from the main page.

## Customer Requirements

Add a new customer entity with these fields:

- `name` required
- `cellNumber` optional
- `email` optional
- `deliveryAddress` optional

The customer catalog must support:

- create
- edit
- delete
- list

This feature introduces basic customer reference data only. It does not introduce billing, account history, order history, or broader CRM behavior.

## Job Relationship Requirements

Jobs may optionally reference a customer.

### Job field

Extend jobs with:

- `customerId` optional or nullable

### Behavior

- jobs may be saved with no customer
- jobs may select one saved customer
- customer assignment is informational only
- customer assignment must not affect costing, markup, status, paid/delivered, or image behavior

## Customer Deletion Rule

If a customer linked to jobs is deleted:

- deletion is allowed
- affected jobs must have their customer link cleared

This feature should not block deletion of customers that are currently referenced by saved jobs.

## Data And API Requirements

### Customer entity

Add a customer model with:

- `id`
- `name`
- `cellNumber`
- `email`
- `deliveryAddress`
- `createdAt`
- `updatedAt`

### Job model extension

Extend the job model with:

- `customerId`

### Persistence updates

Update:

- customers table
- jobs table if customer reference is stored there
- serializers
- repository create/read/update flows
- export/import app-state shape
- bootstrap or preload behavior as needed for catalog data

### API updates

Add customer CRUD API support analogous to filament CRUD.

Likely endpoints should support:

- list customers
- create customer
- update customer
- delete customer

Job payloads should also support:

- reading `customerId`
- saving `customerId`

## Frontend Requirements

### Main page

Filament Management must be removed from the main page.

The main page should remain focused on:

- job workflow
- costing
- results

### Settings and Catalog

Settings must become a drawer/menu with two top-level destinations:

- Defaults
- Catalog

Defaults must remain available as its own dedicated page or view.

Catalog must be the second dedicated page or view and contain:

- Filaments
- Customers

### Job editor

The Job Editor must support optional customer selection from the saved customer catalog.

The UI should make it easy to:

- choose no customer
- choose a saved customer
- preserve the selected customer on reload

## Product Rules

The following rules are mandatory:

- customer assignment is optional
- customer assignment is informational only
- customer assignment must not affect any pricing or costing calculations
- filament management must move under Catalog as part of this feature

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- Filament Management is no longer on the main page
- Settings drawer contains Defaults and Catalog options
- Defaults and Catalog each have their own page or view
- Settings contains a Catalog area
- Catalog contains both Filaments and Customers views
- customer CRUD works with only `name` required
- jobs may be saved with no customer
- jobs may select a saved customer
- deleting a customer clears linked jobs
- export/import preserves customers and job links when valid

### Technical acceptance

- a customers table or equivalent customer persistence exists
- jobs support `customerId`
- repository and serializer flows support customers and job-customer references
- API support exists for customer CRUD and optional job customer references

### Product acceptance

- costing outputs remain unchanged
- pricing suggestions remain unchanged
- the feature adds catalog and customer management only

## Test Requirements

The implementing agent must verify all of the following:

1. Filament Management is no longer on the main page.
2. Settings drawer contains Defaults and Catalog options.
3. Defaults and Catalog each render as their own page or view.
4. Catalog contains both Filaments and Customers views.
5. Customer CRUD works with only `name` required.
6. Jobs may be saved with no customer.
7. Jobs may select a saved customer.
8. Deleting a customer clears linked jobs.
9. Export/import preserves customers and job links when valid.
10. Costing outputs remain unchanged.
11. Pricing suggestion outputs remain unchanged.

## Constraints

- do not split this feature into separate catalog and customer tracks
- do not add billing or CRM behavior
- do not change costing logic
- do not make customer assignment required on jobs

## Deliverables

The implementing agent should deliver:

- a two-option Settings drawer/menu
- a dedicated Defaults page or view
- a Catalog area under Settings
- relocated Filament Management
- customer CRUD support
- optional job customer selection
- updated schema, API, repository, and export/import support

## Definition Of Done

This feature is done when the repository supports a Settings drawer with dedicated Defaults and Catalog pages, Catalog-based Filaments and Customers management, optional customer selection on jobs, safe deletion behavior that clears job links, and no changes to costing behavior.

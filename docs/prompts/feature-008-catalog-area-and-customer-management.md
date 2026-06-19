Implement Feature 008 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\008-catalog-area-and-customer-management.md

Your job is to implement Feature 008 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app for South African Rand pricing.
- The app already uses React + Vite on the frontend and Node.js + Express + SQLite on the backend.
- Feature 008 combines catalog restructuring and customer management in one feature.

Primary goals:
- Turn Settings into a two-option menu flow.
- Move Filament Management out of the main page.
- Keep Defaults as its own dedicated Settings page.
- Add a Catalog section under Settings.
- Add separate Filaments and Customers pages/tabs under Catalog.
- Add customer CRUD support.
- Add optional customer selection on jobs.
- Preserve all costing and pricing behavior.

Customer fields:
- name required
- cellNumber optional
- email optional
- deliveryAddress optional

Job relationship requirements:
- Add optional customerId to jobs.
- Jobs may have no customer selected.
- Customer selection is informational only.
- Customer selection must not affect totals, markup, statuses, paid/delivered, or image behavior.

Customer deletion rule:
- Deleting a customer is allowed.
- If jobs reference that customer, clear the job links.

Implementation requirements:
- Restructure the Settings drawer so it has two top-level options:
  - Defaults
  - Catalog
- Make Defaults and Catalog render as their own pages/views inside Settings.
- Preserve the existing Defaults functionality while moving it into the dedicated Defaults page/view.
- Add customer persistence support.
- Update schema, serializers, repository flows, and API payloads.
- Add customer CRUD API support analogous to filament CRUD.
- Move filament management into the new Catalog area under Settings.
- Add Customers to the same Catalog area.
- Update the frontend job editor so a saved customer can be selected optionally.
- Update export/import so customers and job links are preserved.

Required constraints:
- Do not change costing formulas.
- Do not change pricing suggestion behavior.
- Do not make customer assignment required.
- Do not add billing or CRM behavior.
- Do not split this feature into separate catalog and customer implementations.

Frontend expectations:
- Settings must behave like a menu with:
  - Defaults
  - Catalog
- Defaults must remain available as its own page/view.
- Filament Management must no longer appear on the main page.
- Settings must contain a Catalog area.
- Catalog must contain both Filaments and Customers views.
- Job Editor must support optional customer selection.

Testing and verification requirements:
- Verify Filament Management is no longer on the main page.
- Verify Settings drawer contains Defaults and Catalog options.
- Verify Defaults and Catalog each render as their own page/view.
- Verify Catalog contains Filaments and Customers views.
- Verify customer CRUD works with only name required.
- Verify jobs may be saved with no customer.
- Verify jobs may select a saved customer.
- Verify deleting a customer clears linked jobs.
- Verify export/import preserves customers and job links when valid.
- Verify costing outputs remain unchanged.
- Verify pricing suggestions remain unchanged.

Execution expectations:
- Make the code changes directly in the repo.
- Implement the feature end to end.
- After implementation, summarize:
  - what you changed
  - which files were created or updated
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver Feature 008 so the app gains a Settings drawer with dedicated Defaults and Catalog pages, Catalog-based Filaments and Customers management, optional customer selection on jobs, and unchanged costing behavior.

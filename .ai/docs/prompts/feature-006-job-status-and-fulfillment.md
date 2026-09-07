Implement Feature 006 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\006-job-status-and-fulfillment.md

Your job is to implement Feature 006 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app for South African Rand pricing.
- The app already uses React + Vite on the frontend and Node.js + Express + SQLite on the backend.
- Feature 006 is a job-metadata feature only, not a costing feature.

Primary goals:
- Add job status tracking.
- Add `paid` and `delivered` booleans.
- Persist all three values.
- Preserve all existing costing and pricing behavior.

Required values:
- status values:
  - PLANNING
  - PRINTING
  - COMPLETE
- booleans:
  - paid
  - delivered

Default values for new jobs:
- status = PLANNING
- paid = false
- delivered = false

Implementation requirements:
- Extend the SQLite jobs table to include:
  - status
  - paid
  - delivered
- Update repository and serializer flows.
- Update job create/read/update logic.
- Update export/import app-state behavior.
- Update frontend job editor and any practical display surfaces.
- Keep these fields informational only.

Required constraints:
- Do not change costing formulas.
- Do not change markup suggestions.
- Do not introduce automation rules.
- Do not bundle this with image upload work.
- Do not make these fields affect totals, weights, or machine cost.

Frontend expectations:
- Allow editing status.
- Allow toggling paid.
- Allow toggling delivered.
- Make it clear these are job-management fields rather than costing inputs.

Testing and verification requirements:
- Verify new jobs default to:
  - PLANNING
  - paid = false
  - delivered = false
- Verify status changes persist across restart.
- Verify paid and delivered changes persist across restart.
- Verify export/import preserves these fields.
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
Deliver Feature 006 so the app supports job workflow metadata for status, paid, and delivered while preserving all current costing behavior.

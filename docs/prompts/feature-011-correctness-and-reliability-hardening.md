Implement Feature 011 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\review\correctness-reliability-improvements-pass1.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\011-correctness-and-reliability-hardening.md

Your job is to implement Feature 011 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app with React, Express, shared calculation logic, and SQLite persistence.
- Feature 011 is an architecture and reliability hardening feature, not a new product workflow feature.
- The feature is derived from the independent review document and should be implemented from that perspective.

Primary goals:
- Make job autosave reliable under rapid editing.
- Add server-side validation before persistence.
- Fix print-time normalization and validation.
- Preserve useful partial calculations when one row is invalid.
- Improve persistence safety and API behavior.
- Expand automated regression coverage.
- Clean up obsolete or duplicate implementation paths.

Required autosave behavior:
- update visible job state immediately in the frontend
- debounce persistence
- prevent stale or out-of-order save responses from overwriting newer state
- avoid unnecessary full job-list refresh on every keystroke
- expose save state such as Saving, Saved, or Save failed
- preserve unsaved edits if save fails and allow retry

Required validation behavior:
- validate filament, job, part, settings, and import payloads before persistence
- reject invalid requests with HTTP 400
- return structured validation errors
- prevent persistence of:
  - NaN
  - infinite values
  - negative costs
  - negative time
  - invalid quantities
  - malformed records

Required time behavior:
- minutes must be constrained to integer 0-59
- frontend and backend rules must match
- splitting decimal hours must never return 60 minutes
- normalize through total minutes
- add boundary and rounding tests

Required partial-calculation behavior:
- validate rows independently
- continue calculating valid rows while invalid rows contribute zero
- preserve row-level validation messages
- mark overall job calculation incomplete when needed
- suppress or clearly qualify final selling suggestions until the job is fully valid
- do not zero all valid totals because one row is incomplete

Required persistence/API behavior:
- return 404 for update/delete on missing jobs or filaments
- keep multi-table job saves transactional
- prevent partial writes on failure
- standardize API error responses
- keep repository methods focused on persistence, not UI assumptions

Required testing behavior:
- introduce or expand a proper automated test suite
- run tests as part of npm run verify
- report individual failures clearly
- cover calculations, validation, boundaries, partial calculations, status codes, and stale autosave protection

Required cleanup behavior:
- confirm whether top-level scripts/ is still required
- remove obsolete files or move them to a clearly labeled archive
- ensure README and verification refer only to the active implementation
- avoid duplicate active calculation or persistence logic without a documented reason

Required constraints:
- Do not treat this as a product feature.
- Do not use this feature to introduce unrelated architectural experiments.
- Do not change costing formulas for business reasons.
- If import still exists at implementation time, harden it appropriately; if another feature has already removed it, scope that part accordingly.

Testing and verification requirements:
- Verify rapid typing cannot roll fields back.
- Verify invalid API/input data cannot be persisted.
- Verify minutes always remain in 0-59.
- Verify valid rows still calculate when another row is invalid.
- Verify missing records return 404.
- Verify multi-table writes remain atomic.
- Verify npm run verify runs focused automated tests plus the frontend build.
- Verify only one authoritative implementation remains in the active source tree.

Execution expectations:
- Make the code changes directly in the repo.
- Implement the feature end to end.
- After implementation, summarize:
  - what you changed
  - which files were created or updated
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver Feature 011 so the app becomes more correct, reliable, and maintainable under real editing and persistence conditions, without changing its intended product behavior.

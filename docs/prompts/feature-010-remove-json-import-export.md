Implement Feature 010 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\010-remove-json-import-export.md

Your job is to implement Feature 010 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app backed by SQLite.
- Feature 010 removes JSON import/export completely.
- Feature 010 also removes legacy app-state import/migration support.

Primary goals:
- Remove `Export JSON` and `Import JSON` from the UI.
- Remove frontend import/export handlers, service methods, and messages.
- Remove backend `/api/app-state/export`.
- Remove backend `/api/app-state/import`.
- Remove backend app-state support code and legacy v1 import compatibility.
- Standardize the app on local SQLite persistence only.

Required constraints:
- Do not keep hidden or unofficial JSON import/export support.
- Do not remove only the UI while preserving app-state import/export as a supported backend capability.
- Do not change costing formulas.
- Do not change pricing suggestion behavior.
- Do not change unrelated job, filament, settings, catalog, customer, status, or image behaviors.

Implementation requirements:
- Remove frontend import/export actions from the header or any other UI.
- Remove frontend import/export file handling and notifications/messages.
- Remove frontend service methods for app-state import/export.
- Remove backend app-state routes and related support code.
- Remove legacy v1 import/migration behavior tied to app-state import.
- Update verification coverage so it no longer checks JSON import/export or import-based migration.
- Update active/current-facing docs such as `docs/architecture.md` so they no longer present JSON import/export as supported.

Persistence expectations after this feature:
- SQLite is the only supported persistence mechanism.
- No portable JSON backup/restore remains.
- No legacy app-state import/migration path remains.

Testing and verification requirements:
- Verify import/export actions are no longer present in the UI.
- Verify frontend no longer references app-state import/export APIs.
- Verify backend app-state import/export routes are removed or unavailable.
- Verify legacy v1 import/migration through app-state import is removed.
- Verify all remaining workflows still work.
- Verify local database persistence still works across restart.
- Verify current-facing platform docs no longer describe JSON import/export as supported.

Execution expectations:
- Make the code changes directly in the repo.
- Implement the feature end to end.
- After implementation, summarize:
  - what you changed
  - which files were created or updated
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver Feature 010 so the app fully removes JSON import/export and legacy app-state migration support, and remains a local SQLite-backed application with all other behavior intact.

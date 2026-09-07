Implement Feature 009 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\009-filament-preview-in-job-parts.md

Your job is to implement Feature 009 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app for South African Rand pricing.
- The app already includes filament management and filament selection inside job part rows.
- Feature 009 is a frontend usability enhancement only.

Primary goals:
- Show richer filament identity in job part-row dropdown options.
- Show a compact selected-filament preview below the field after selection.
- Preserve all current costing, pricing, and persistence behavior.

Required filament identity cues:
- name
- brand
- color

Implementation requirements:
- Update the job editor filament selection UI.
- Render richer filament labels in the dropdown options.
- Add a compact selected-filament preview below the filament field.
- Keep the selector searchable.
- Handle missing brand or color gracefully.

Recommended display behavior:
- primary line: filament name
- secondary line or compact text: brand • color
- if values are missing, use safe fallback text such as Unspecified or omit missing parts cleanly

Required constraints:
- Do not change filament schema.
- Do not change job schema.
- Do not change costing formulas.
- Do not change export/import behavior.
- Do not change persistence behavior.

Technical expectations:
- Reuse filament fields already available in frontend payloads.
- Do not add backend schema work unless a very small support tweak is unexpectedly required.
- Keep this feature focused on the job editor UI.

Testing and verification requirements:
- Verify dropdown options show name, brand, and color.
- Verify selected preview appears after filament selection.
- Verify preview handles missing brand or color cleanly.
- Verify searchable behavior still works.
- Verify changing filament still updates costing as before.
- Verify no pricing behavior changes are introduced.
- Verify no persistence behavior changes are introduced.

Execution expectations:
- Make the code changes directly in the repo.
- Implement the feature end to end.
- After implementation, summarize:
  - what you changed
  - which files were created or updated
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver Feature 009 so the job editor shows richer filament identity in part-row selection and preview, while preserving all existing costing and persistence behavior.

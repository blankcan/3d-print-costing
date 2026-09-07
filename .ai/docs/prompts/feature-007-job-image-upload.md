Implement Feature 007 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\007-job-image-upload.md

Your job is to implement Feature 007 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app for South African Rand pricing.
- The app already uses React + Vite on the frontend and Node.js + Express + SQLite on the backend.
- Feature 007 is a job image attachment feature only, not a pricing or workflow-calculation feature.

Primary goals:
- Add support for one primary image per job.
- Use local file storage on disk.
- Store a database path/reference for the job image.
- Support upload, preview, replace, and remove behavior.
- Preserve all existing costing and pricing behavior.

Implementation requirements:
- Add a job image field, likely:
  - imagePath
  - imageFileName
  - or equivalent single-image reference
- Extend schema, repository, serializer, and API support as needed.
- Implement local upload handling.
- Validate supported image uploads.
- Implement frontend image preview and management UI.
- Persist the image reference across restart.
- Define and implement export/import behavior clearly.

Required constraints:
- Do not add multi-image support.
- Do not use cloud storage.
- Do not change costing formulas.
- Do not change markup/pricing behavior.
- Do not bundle this with status/paid/delivered work.

Frontend expectations:
- Allow attaching one image to a job.
- Show the current image preview when present.
- Allow replacing the current image.
- Allow removing the image.
- Make the image state understandable in the job workflow.

Testing and verification requirements:
- Verify one supported image can be uploaded.
- Verify image preview appears correctly.
- Verify replace behavior works.
- Verify remove behavior works.
- Verify the image reference survives restart.
- Verify export/import behavior matches the implemented spec.
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
Deliver Feature 007 so the app supports one primary image per job using local file storage and a database reference, while preserving all current costing behavior.

# Feature 007: Job Image Upload

## Objective

Add support for a single primary image attachment on each job.

This feature introduces local image upload and storage so users can attach one representative job image, preview it, replace it, and remove it while keeping the app local-first.

The image should be stored as a local file on disk, with the database storing a path or equivalent image reference.

## Outcome

At the end of this feature, the app should support:

- one primary image per job
- image upload
- image preview
- image replace
- image remove
- persistence of the image reference across restart

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`

This feature extends the current local platform with a file-backed attachment capability for jobs.

## Scope

### In scope

- one image per job
- local file storage on disk
- database-stored file reference or path
- upload handling
- file validation
- preview current image
- replace current image
- remove current image
- persistence across restart
- frontend job image UI
- export/import behavior definition and implementation

### Out of scope

- multiple images per job
- cloud image storage
- image editing
- gallery management
- costing formula changes

## Storage Model

The preferred storage model is:

- store uploaded image files on disk locally
- store the corresponding image path or file reference in the database

This feature must not store the image itself as base64 inside the main job record by default.

## Job Image Requirements

Each job may have:

- zero images
- or one primary image

The system must support:

- attaching an image to a job
- replacing the existing image
- removing the image entirely

## Backend Requirements

The backend will likely need:

- upload handling
- validation of supported image types
- a local storage directory convention
- a safe path/reference persistence model
- a way for the frontend to preview the saved image

### Validation expectations

The upload flow should validate:

- supported image formats
- invalid or missing upload payloads

The spec should keep validation simple and practical for a local-first app.

### Schema requirements

Add a job image field, likely one of:

- `imagePath`
- `imageFileName`
- or equivalent single-image reference

The final shape should support one primary image per job.

## Frontend Requirements

The frontend should provide:

- an upload control
- a preview of the current job image
- a replace action
- a remove action

The image UI should live within the job workflow in a practical location.

The UI should make clear whether a job currently has an image attached.

## Export/Import Requirements

This feature must explicitly define and implement export/import behavior.

The spec should cover whether:

- export/import includes only the image reference
- or export/import also copies/bundles the image asset

The implementation must choose a clear behavior and verify it.

Because this is a local-file-backed feature, portability expectations should be documented rather than left implicit.

## Product Rules

This feature must preserve:

- all costing formulas
- all pricing behavior
- all existing job-management semantics unrelated to images

The image attachment is informational and visual only.

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- one supported image can be attached to a job
- the attached image can be previewed
- the image can be replaced
- the image can be removed
- the image reference persists across restart

### Technical acceptance

- local file storage is used
- the database stores a job image reference/path
- the frontend can render the saved image reference correctly
- export/import behavior is clearly implemented and documented

### Product acceptance

- costing outputs remain unchanged
- pricing suggestion outputs remain unchanged
- this feature does not alter the pricing model

## Test Requirements

The implementing agent must verify all of the following:

1. One supported image can be uploaded to a job.
2. The image preview appears correctly.
3. Replace behavior works.
4. Remove behavior works.
5. The image reference survives restart.
6. Export/import behavior matches the implemented spec.
7. Costing outputs remain unchanged.
8. Pricing suggestion behavior remains unchanged.

## Constraints

- do not add multiple-image support in this feature
- do not move image storage to a cloud service
- do not change costing logic
- do not mix this feature with job-status metadata

## Deliverables

The implementing agent should deliver:

- job image storage support
- database support for a single image reference per job
- upload/preview/replace/remove UI
- explicit export/import behavior for image-backed jobs

## Definition Of Done

This feature is done when the repository supports one primary image per job using local file storage plus a persisted database reference, with working upload, preview, replace, and remove behavior and no changes to costing logic.

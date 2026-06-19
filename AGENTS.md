# 3D Print Costing - Agent Instructions

## Purpose

This application is a local-first 3D print costing tool for calculating material, machine, and selling prices for 3D printed parts.

The goal of this project is simplicity, correctness, maintainability, and local usability.

Agents should favour straightforward solutions over sophisticated ones.

---

## Source of Truth

The source of truth for this project is:

1. docs/architecture.md
2. Relevant feature specifications
3. Existing implementation

When documentation and implementation differ:

- Identify the discrepancy.
- Do not silently choose one.
- Raise the inconsistency and propose a resolution.

---

## Before Starting Any Work

Always review:

1. `docs/architecture.md`
2. Relevant files in `docs/features/`
3. Relevant files in `docs/reviews/`

Do not begin implementation until the existing architecture and feature history are understood.

If a requested change conflicts with the documented architecture, raise the conflict rather than silently changing direction.

---

## Core Principles

### Local First

This application is intentionally local-first.

Prefer:

- SQLite
- Local persistence
- Simple deployment
- Minimal infrastructure

Avoid introducing:

- Cloud dependencies
- Authentication systems
- User management
- Multi-tenant architecture
- External services

Unless explicitly requested.

---

### Shared Domain Logic

Business rules belong in:

```text
shared/calculations/
```

Do not duplicate calculation logic between frontend and backend.

The shared layer is the single source of truth for:

- Costing calculations
- Validation rules
- Markup calculations
- Domain behaviour

---

### Keep Features Small

Implement one concern at a time.

Prefer:

```text
Feature A
Feature B
Feature C
```

over:

```text
Large Feature Containing A + B + C
```

Small focused features are easier to review, verify, and maintain.

---

### Prefer Existing Patterns

Before introducing a new pattern:

- Inspect existing code
- Identify established conventions
- Extend existing approaches where practical

Avoid introducing multiple competing approaches to the same problem.

Consistency is preferred over novelty.

---

## Architecture Rules

### Frontend

Frontend responsibilities:

- User interaction
- Presentation
- Local editing state
- API communication

Frontend should not contain duplicated business calculations.

---

### Backend

Backend responsibilities:

- Persistence
- Validation
- Application state management
- Import/export
- API endpoints

Backend should remain thin and focused.

---

### Persistence

SQLite is the primary datastore.

Requirements:

- Transactional writes
- Atomic import operations
- Data integrity over optimisation

Avoid premature database abstraction.

---

## Validation

Never trust UI constraints alone.

All externally supplied data must be validated before persistence.

Validation should protect against:

- Invalid numbers
- Negative values where not allowed
- Malformed payloads
- Invalid references
- Import corruption

---

## Documentation

Documentation is a first-class project artifact.

When behaviour changes:

- Update feature documentation where applicable
- Update architecture documentation where applicable
- Keep documentation aligned with actual implementation

Documentation should describe the current system, not an outdated design.

---

## Testing

Changes affecting calculations, validation, persistence, or import/export behaviour should include verification coverage.

When introducing new domain behaviour:

- Verify existing behaviour still works
- Add focused regression coverage where appropriate

Do not modify calculation logic without verifying expected outputs.

---

## Review Checklist

Before considering work complete:

- Architecture remains consistent.
- Existing behaviour is not duplicated.
- Shared calculations remain the source of truth.
- Documentation reflects the implementation.
- Validation exists at appropriate boundaries.
- Data integrity is preserved.
- `npm run verify` passes.

---

## Non-Goals

Do not introduce the following without an explicit feature request:

- Authentication
- User accounts
- SaaS functionality
- Multi-user support
- Cloud storage
- Printer telemetry
- Inventory management
- Customer relationship management
- Complex plugin systems
- Microservices

This application intentionally favours simplicity over extensibility.

---

## Decision Guidance

When multiple valid solutions exist:

1. Choose the simplest solution.
2. Choose the solution that matches existing architecture.
3. Choose the solution with the lowest maintenance burden.
4. Document significant architectural decisions.

Favour long-term clarity over short-term cleverness.
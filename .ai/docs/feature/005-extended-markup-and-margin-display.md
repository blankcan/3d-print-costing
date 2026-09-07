# Feature 005: Extended Markup And Margin Display

## Objective

Enhance the pricing-output section by extending markup suggestions beyond the current 100% ceiling and displaying margin information alongside each suggestion row.

This feature must preserve the current markup-based pricing model while improving the usefulness of the selling suggestions table for higher-margin scenarios and clearer profitability interpretation.

The system must continue to use markup as the pricing input model. Margin is added only as informational output.

## Outcome

At the end of this feature, the app should provide:

- selling suggestions from `10%` to `100%` in `10%` increments
- additional selling suggestions from `125%` to `250%` in `25%` increments
- a dedicated `Margin %` column in the results table
- unchanged existing outputs for all rows up to `100%`

## Required Reading

The implementing agent must read and follow:

- `docs/architecture.md`
- `docs/feature/002-v2-local-platform.md`

This feature builds on the current v2 architecture and pricing-output behavior.

## Scope

### In scope

- extend the markup suggestion range
- add `marginPercent` to each suggestion row
- update the selling suggestions results table
- preserve existing pricing outputs for the current 10% to 100% range
- preserve markup as the pricing model

### Out of scope

- changing the pricing model from markup to margin
- adding target-margin input behavior
- adding persistence for pricing presets
- changing backend API structure
- changing database schema

## Pricing Suggestion Requirements

### Existing range to preserve

The app must continue to show:

- `10%`
- `20%`
- `30%`
- `40%`
- `50%`
- `60%`
- `70%`
- `80%`
- `90%`
- `100%`

These rows must remain unchanged in behavior and output.

### Extended range to add

After `100%`, the app must also show:

- `125%`
- `150%`
- `175%`
- `200%`
- `225%`
- `250%`

This means the sequence is:

- `10%` through `100%` in `10%` increments
- then `125%` through `250%` in `25%` increments

## Calculation Requirements

Each suggestion row must contain:

- `markupPercent`
- `suggestedTotalPriceZar`
- `profitZar`
- `marginPercent`

### Existing formulas to preserve

For each suggestion row:

- `suggestedTotalPriceZar = grandTotalCostZar * (1 + markupPercent / 100)`
- `profitZar = suggestedTotalPriceZar - grandTotalCostZar`

### New margin formula

For each suggestion row:

- `marginPercent = profitZar / suggestedTotalPriceZar * 100`

If `suggestedTotalPriceZar` is zero, margin should safely fall back to `0` to avoid invalid output.

## Product Clarifications

This feature must explicitly preserve these rules:

- markup remains the pricing input model
- margin is informational output only
- this feature does not convert the system into target-margin pricing

The user is still choosing or reviewing markup-based recommendations. The newly displayed margin value is there to help interpret profitability more clearly.

## Frontend Requirements

Update the Selling Suggestions table so it includes these columns:

- Markup
- Suggested Price
- Profit
- Margin %

### Display requirements

- `Margin %` must be a dedicated column
- margin must not be appended inside the Profit cell
- Profit must remain displayed in Rand
- the table should remain readable and aligned with the current results panel
- the extended list should still be usable on large, medium, and small screens

### Formatting requirements

- `Suggested Price` and `Profit` should use existing currency formatting
- `Margin %` should use sensible percentage formatting
- percentage precision should be consistent and readable

## Technical Requirements

### Shared calculation module

Update the shared calculation module so:

- the suggestions generator includes rows above `100%`
- each generated row includes `marginPercent`

### Frontend consumer changes

Update the frontend results rendering so:

- the new `marginPercent` field is displayed
- the table supports the longer suggestions list

## API And Data Considerations

No new backend persistence model is required.

No new database schema is required.

No new API endpoints are required.

Existing calculation payloads should simply gain:

- `marginPercent`

on each suggestion row.

## Acceptance Criteria

The feature is complete when all of the following are true.

### Functional acceptance

- suggestion rows include `10%` through `100%` in `10%` increments
- suggestion rows include `125%` through `250%` in `25%` increments
- each suggestion row includes `markupPercent`, `suggestedTotalPriceZar`, `profitZar`, and `marginPercent`
- the results table includes a dedicated `Margin %` column

### Calculation acceptance

- Profit remains correct in Rand for every suggestion row
- Margin % is calculated correctly for every suggestion row
- all outputs up to `100%` remain unchanged from previous behavior
- the new rows above `100%` are calculated correctly

### UX acceptance

- the table remains readable with the additional rows and column
- the selling suggestions panel remains usable on large, medium, and small screens

## Test Requirements

The implementing agent must verify all of the following:

1. Suggestion rows include `10%` through `100%` in `10%` increments.
2. Suggestion rows include `125%` through `250%` in `25%` increments.
3. Profit remains correct in Rand for each row.
4. Margin % is calculated correctly for each row.
5. Worked-example values up to `100%` remain unchanged.
6. New rows above `100%` are present and correct.
7. The selling suggestions table remains readable on large screens.
8. The selling suggestions table remains usable on medium and small screens.

## Constraints

- do not change the pricing model from markup to margin
- do not remove the current markup range up to `100%`
- do not replace Profit with Margin %
- do not require new storage or schema changes for this feature

## Deliverables

The implementing agent should deliver:

- updated feature calculations for expanded markup suggestions
- updated suggestion rows including `marginPercent`
- updated results-table rendering with a dedicated `Margin %` column
- preserved pricing behavior for all previously existing rows

## Definition Of Done

This feature is done when the repository contains an updated selling suggestions section that extends markup recommendations through `250%`, adds a dedicated `Margin %` column, preserves all existing outputs up to `100%`, and keeps the system markup-based rather than margin-driven.

Implement Feature 005 for this repository.

Start by reading these files fully:
- C:\Users\WillP\Documents\3D printing costing\docs\architecture.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\002-v2-local-platform.md
- C:\Users\WillP\Documents\3D printing costing\docs\feature\005-extended-markup-and-margin-display.md

Your job is to implement Feature 005 exactly as described in those documents.

Project context:
- Repo root: C:\Users\WillP\Documents\3D printing costing
- This is a local-first 3D printer costing app for South African Rand pricing.
- The app already has markup-based selling suggestions in the results section.
- Feature 005 is a pricing-output enhancement, not a pricing-model change.

Primary goals:
- Extend markup suggestions beyond `100%`.
- Preserve the current `10%` to `100%` rows in `10%` increments.
- Add new rows from `125%` to `250%` in `25%` increments.
- Add a dedicated `Margin %` column in the selling suggestions table.
- Preserve the existing Rand profit column.

Required constraints:
- Do not change the pricing model from markup to margin.
- Do not introduce target-margin pricing inputs.
- Do not replace Profit with Margin %.
- Do not change existing outputs for rows up to `100%`.
- Do not add new persistence or schema requirements for this feature.

Implementation requirements:
- Update the shared calculation module so suggestion rows include:
  - markupPercent
  - suggestedTotalPriceZar
  - profitZar
  - marginPercent
- Preserve the existing formulas:
  - suggestedTotalPriceZar = grandTotalCostZar * (1 + markupPercent / 100)
  - profitZar = suggestedTotalPriceZar - grandTotalCostZar
- Add the new formula:
  - marginPercent = profitZar / suggestedTotalPriceZar * 100
- Safely handle any zero-price edge case by falling back to `0` margin.

Suggestion sequence requirements:
- Keep:
  - 10%
  - 20%
  - 30%
  - 40%
  - 50%
  - 60%
  - 70%
  - 80%
  - 90%
  - 100%
- Add:
  - 125%
  - 150%
  - 175%
  - 200%
  - 225%
  - 250%

Frontend requirements:
- Update the Selling Suggestions table to include:
  - Markup
  - Suggested Price
  - Profit
  - Margin %
- Use a dedicated Margin % column.
- Keep the existing Profit Rand value visible.
- Keep the table readable and usable across large, medium, and small screens.
- Use sensible percentage formatting for margin values.

Technical expectations:
- No new backend API endpoints are required.
- No database schema changes are required.
- Existing calculation payloads may simply gain `marginPercent` on each suggestion row.
- Update any affected frontend rendering logic to support the extra field and extended list length.

Testing and verification requirements:
- Verify suggestion rows include:
  - 10% through 100% in 10% increments
  - 125% through 250% in 25% increments
- Verify Profit remains correct in Rand for each row.
- Verify Margin % is calculated correctly for each row.
- Verify worked-example values up to 100% remain unchanged.
- Verify new rows above 100% are present and correct.
- Verify the results table remains readable on large, medium, and small screens.

Execution expectations:
- Make the code changes directly in the repo.
- Implement the feature end to end, not just the calculation helper or only the UI column.
- After implementation, summarize:
  - what you changed
  - which files were created or updated
  - how you verified it
  - any known limitations or follow-up items

Goal:
Deliver Feature 005 so the app offers extended markup suggestions through `250%`, displays a dedicated `Margin %` column, preserves all existing outputs up to `100%`, and remains fully markup-based.

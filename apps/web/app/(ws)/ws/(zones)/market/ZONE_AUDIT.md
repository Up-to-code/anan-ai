# Workspace UI `market` Audit

## Current Boundary Risks
- The zone is component-heavy, so generic-looking widgets can accidentally become pseudo-shared components without an explicit extraction decision.
- `MarketPage/` is broad and should remain the only place that knows its local widget tree.

## SOLID Findings
- Loader, view model, and page-module separation is already a good pattern here.
- The main future risk is letting view shaping leak into random table/chart components.

## Cleanup Decisions In This Pass
- Added root zone docs, register, and audit files to make the market surface readable from outside.

## Deferred Follow-Ups
- If market widgets start being reused outside this zone, promote them deliberately to a true shared UI surface instead of importing them ad hoc.

# Workspace UI `market` Audit

## Current Boundary Risks
- The zone is component-heavy, so generic-looking widgets can accidentally become pseudo-shared components without an explicit extraction decision.
- `pages/MarketPage/` is broad and should remain the only place that knows its local widget tree.

## SOLID Findings
- Loader, view model, fixture, and page-module separation is a good pattern here.
- The main future risk is letting view shaping leak into random table/chart components.

## Cleanup Decisions In This Pass
- Moved the page module into `pages/`.
- Moved route tabs into `shared/navigation`, loader/view-model logic into `shared/lib`, types into `types/`, and mock data into `fixtures/`.

## Deferred Follow-Ups
- If market widgets start being reused outside this zone, promote them deliberately to a true shared UI surface instead of importing them ad hoc.

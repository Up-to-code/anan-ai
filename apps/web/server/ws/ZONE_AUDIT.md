# Workspace Server Zone Audit

## Current Boundary Risks
- `ws` used to know individual `broker_zone/*` and `red_zone/*` subpaths directly.
- CRM, offers, and properties dispatchers are compact, but they still encode repeated audience branching that should stay isolated to this zone.

## SOLID Findings
- Responsibilities are mostly correct: route code stays thin while `ws` owns audience dispatch.
- The biggest cleanup need was making the broker/red root gateways explicit.

## Cleanup Decisions In This Pass
- Added `apps/web/server/broker_zone/index.ts` and `apps/web/server/red_zone/index.ts`.
- Updated `ws` dispatchers and tests to depend on the root gateways instead of multiple internal subpaths.
- Reorganized the zone into `capabilities/`, `session/`, and `shared/` while keeping `zones.ts` as the stable public gateway.

## Deferred Follow-Ups
- If more workspace capabilities appear, consider extracting a shared audience-dispatch helper to reduce repeated branching shape.

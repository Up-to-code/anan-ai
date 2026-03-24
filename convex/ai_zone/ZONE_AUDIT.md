# `ai_zone` Zone Audit

## Current Boundary Risks
- `services/assistantService.ts` is the largest file in the audited zones and mixes orchestration, context building, persistence, and runtime policy.
- `assistantWorkspace.ts` still carries a broad surface area for thread, stream, and persistence concerns.
- AG UI shaping currently lives inside the runtime service layer rather than behind a narrower presenter boundary.

## SOLID Findings
- Single-responsibility pressure is concentrated in assistant orchestration and workspace assistant entrypoints.
- Internal interfaces are stronger than external ones: the zone has good conceptual boundaries, but the public path into those boundaries is not yet minimal.

## Cleanup Decisions In This Pass
- Keep `ai_zone` local; do not package runtime logic.
- Document the public path as `assistant*.ts` and webhooks, not individual teams/tools.

## Deferred Follow-Ups
- Split `assistantService.ts` into context assembly, orchestration dispatch, persistence, and response formatting collaborators.
- Carve a narrower presenter boundary around `services/agUi.ts`.
- Continue separating workspace-specific assistant behavior from shared runtime behavior inside `assistantWorkspace.ts`.

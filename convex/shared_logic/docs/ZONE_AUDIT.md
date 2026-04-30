# `shared_logic` Zone Audit

## Current Boundary Risks
- Root-level legacy files and capability folders coexist, which makes the public surface harder to read than it should be.
- `inbox.ts` and market-related files are oversized enough to deserve future splitting.
- `lib/providers.ts` currently reaches into AI configuration, which is a real but intentional dependency edge that should stay documented.

## SOLID Findings
- Single-responsibility pressure is highest in `inbox.ts` and `market/analytics.ts`.
- Interface clarity is uneven: some capabilities have `index.ts` gateways, while others still expose root files directly.

## Cleanup Decisions In This Pass
- Keep the zone local and document capability-first entrypoints.
- Do not package or flatten `shared_logic`; the right next step is targeted internal cleanup, not extraction.
- Moved offer case services behind `offers/cases/` while keeping the stable entry modules intact.
- Root project and organization entry files should stay as compatibility exports while
  implementations live in capability folders.

## Deferred Follow-Ups
- Split `inbox.ts` into read-model, action, and formatting modules.
- Normalize `market.ts` vs `market/*` so there is one obvious public entrypoint.
- Continue adding explicit `index.ts` gateways to capability folders that still rely on root files.

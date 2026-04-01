# Convex Unused Code Audit

## Safe Cleanup Done

- Removed the empty legacy trainer agent directory tree under `convex/ai_zone/agents/`.

## Active Legacy Candidates

These still have active callers or test coverage, so they are **not** cleanup-safe in the current pass:

- `convex/ai_zone/assistantWorkspace.streamMaintenance.ts`
  Keeps `legacyOnly` handling that is still referenced by the workspace assistant maintenance flow.
- `convex/ai_zone/services/assistantService/threads.ts`
  Still merges `legacyUserThreads` into the active thread-access path.
- `convex/ai_zone/agents/AnanAgent.ts`
  Still provides `AnanAgentResult`, which is imported by the public and workspace orchestrator types/result mergers.
- `convex/shared_logic/offers/cases/shared.ts`
  Legacy offer-state mappers are still imported by live offer-case queries.
- `convex/admin_zone/tenantsMigration.ts`
  Migration surface is still exposed and covered by tests.
- `convex/_core/security/authProviderErrors.ts`
  Still present in generated Convex API and paired tests.
- `convex/_core/security/migrations.ts`
  Still present in generated Convex API as an explicit migration helper surface.

## Follow-Up Rule

Only remove a candidate from the list above after:

1. Removing all live imports/callers.
2. Updating or deleting the associated tests.
3. Running `npx convex codegen`.
4. Running targeted tests plus `pnpm typecheck`.

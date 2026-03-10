# ai_zone Zone (Backend)

## Ownership
This zone owns assistant endpoints, orchestration, agent definitions, shared AI runtime behavior, and multi-channel adapters.

## Architecture
- `assistant.ts`
  Thin controller for assistant endpoints.
- `services/assistantService.ts`
  Resolves owner identity, mode, context, orchestration, and persistence.
- `agents/core/`
  Shared configurable agent runtime, prompt policy, tool bundles, and factory.
- `agents/anan/`
  Orchestrator, intent analysis, team registry, and merge logic.
- `agents/team_*/`
  Declarative agent definitions plus team-local tools.
- `agents/shared/`
  Cross-team analytics, token tracking, retry helpers, workflows, and RAG helpers.
- `channels/`
  WhatsApp preprocessing, transport, and webhook integration.

## Rules
1. `assistant.ts` only wires public endpoints.
2. The orchestrator is the single entrypoint for runtime agent dispatch.
3. Team registry is the only source of truth for team membership and role access.
4. Tool calls happen inside configured agents, never directly from the orchestrator.

# Backend AI Multi-Agent System

## Summary
The AI backend is built from declarative agent definitions plus one shared runtime. Changing retries, prompt assembly, fallback model behavior, or analytics should happen once in `core/`, not in each agent config.

## Structure
- `core/`
  Shared `AgentDefinition` contracts, prompt builders, tool bundle helpers, and the factory/runtime.
- `anan/`
  Main orchestration path: intent routing, team registry, parallel execution, and merge.
- `team_search/`, `team_property/`, `team_finance/`, `team_knowledge/`, `team_trainer/`
  Team-owned agent definitions and tools.
- `shared/`
  Token tracking, orchestration analytics, retry/error helpers, RAG helpers, and workflows.
- `scaffold/`
  Documentation for the developer scaffolding path; CLI generation lives in `/scripts/create-agent.ts`.

## Rules
1. Concrete agents are definitions, not custom runtimes.
2. The factory creates runtime instances from definitions.
3. Prompt text should be expressed through structured prompt definitions.
4. Analytics are emitted automatically by shared runtime code.

# `ai_zone` Zone

## Ownership And Purpose
`convex/ai_zone` owns workspace assistant endpoints, multi-agent orchestration, AG UI turn assembly, and AI runtime services for Anan.

## Why This Zone Exists
Assistant behavior, tool orchestration, and streaming/runtime concerns should not leak across workspace flows. `ai_zone` keeps the AI runtime centralized while still delegating shared business facts to `shared_logic`.

## Architecture Overview
- `assistant.ts`, `assistantWorkspace.ts`, `assistantPro.ts`: workspace Convex entrypoints
- `services/`: assistant orchestration, AG UI assembly, voice transcription/synthesis
- `agents/core/`: runtime abstractions and registries
- `agents/anan_workspace` and `agents/team_workspace_*`: orchestrators, teams, tools, and definitions
- `workflows/`: workflow-managed background orchestration

## Flowchart
```mermaid
flowchart LR
  A["Workspace client"] --> B["assistantWorkspace.ts"]
  B --> C["services/assistantService.ts"]
  C --> D["agents/anan_workspace + team_workspace_*"]
  D --> E["shared_logic + tools + workflows"]
  E --> F["Persisted response / AG UI"]
```

## Stable Entrypoints
- `assistantWorkspace.ts` for workspace assistant flows
- `assistantPro.ts` and `assistant.ts` as compatibility aliases for workspace assistant flows
- `services/agUi.ts` for AG UI turn shaping inside the AI runtime

## Outside-In Usage
Call `ai_zone` through assistant entry files. Do not import individual team agents or internal tool modules from outside the zone. If a feature needs shared business data, route that need through `shared_logic` or documented service helpers rather than coupling directly to team internals.

## Allowed And Forbidden Imports
- Allowed: `_core`, `shared_logic`, workflow infrastructure
- Allowed: internal reuse across `services/` and `agents/`
- Forbidden: UI/server route code, or direct external consumption of `team_*` folders
- Forbidden: bypassing the orchestrator and calling team internals as if they were public APIs

## Dependency Map
- Upstream consumers: workspace chat and internal AI workflows
- Downstream dependencies: `shared_logic`, storage, LLM providers, workflow runtime

## Common Extension Tasks
- Add a new assistant flow: start with the appropriate `assistant*.ts` entrypoint and its service wiring
- Add a new agent or tool: place it under the correct `agents/team_*` folder and register it through the orchestrator
- Add a new channel adapter: place preprocessing/webhook logic under `channels/`

## Related Docs
- `convex/ai_zone/ZONE_REGISTER.md`
- `convex/ai_zone/ZONE_AUDIT.md`
- `docs/handbook/convex/ai-zone.md`

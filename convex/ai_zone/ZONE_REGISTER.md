# `ai_zone` Zone Register

## Top-Level Ownership
- `assistant*.ts`: workspace assistant entrypoints
- `services/`: runtime orchestration, AG UI shaping, voice services
- `agents/core/`: runtime abstractions, registries, prompt policy
- `agents/anan_workspace`: orchestrator and merge/intent logic
- `agents/team_workspace_*`: team-local agents and tools
- `agents/shared/`: token tracking, retries, RAG, workflows
- `workflows/`: workflow entrypoints

## Important Files And Exports
- `services/assistantService.ts`: main orchestration service for assistant requests
- `services/agUi.ts`: AG UI payload shaping for assistant responses
- `assistantWorkspace.ts`: workspace thread/message/stream API surface
- `assistant.ts` and `assistantPro.ts`: compatibility aliases for the workspace assistant
- `agents/anan_workspace/index.ts`: orchestrator-level entrypoint

## Main Consumers
- workspace UI and AG UI clients
- AI support workflows and telemetry

## Public Vs Internal
- Public to the repo: `assistant*.ts` and high-level services
- Internal: team tool modules and prompt internals

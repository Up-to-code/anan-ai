# `ai_zone` Zone Register

## Top-Level Ownership
- `assistant*.ts`: public/internal assistant entrypoints by audience
- `services/`: runtime orchestration, AG UI shaping, voice services
- `agents/core/`: runtime abstractions, registries, prompt policy
- `agents/anan*`: orchestrators and merge/intent logic
- `agents/team_*`: team-local agents and tools
- `agents/shared/`: token tracking, retries, RAG, workflows
- `channels/`: channel adapters and webhook support
- `workflows/`: workflow entrypoints

## Important Files And Exports
- `services/assistantService.ts`: main orchestration service for assistant requests
- `services/agUi.ts`: AG UI payload shaping for assistant responses
- `assistantWorkspace.ts`: workspace thread/message/stream API surface
- `channels/whatsapp/webhook.ts`: WhatsApp HTTP verification and inbound handling
- `agents/anan/index.ts` and `agents/anan_workspace/index.ts`: orchestrator-level entrypoints

## Main Consumers
- workspace UI and AG UI clients
- public assistant entry surfaces
- WhatsApp and other AI channels
- AI support workflows and telemetry

## Public Vs Internal
- Public to the repo: `assistant*.ts`, webhook entrypoints, high-level services
- Internal: team tool modules, prompt internals, low-level preprocessing details

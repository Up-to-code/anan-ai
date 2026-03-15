# Current Usage in This Repo

This page shows where AI zone is used today and what each caller is doing.

## Workspace UI Integration

| Location | What It Does | API Target |
|---|---|---|
| `apps/web/server/infrastructure/convex/ananProRepository.ts` | Server-side repository for workspace assistant threads and messages. | `ai_zone/assistantWorkspace` |

## WhatsApp Channel

| Location | What It Does | API Target |
|---|---|---|
| `convex/ai_zone/channels/whatsapp/webhook.ts` | Receives WhatsApp messages and triggers AI response generation. | `ai_zone/channels/whatsapp/actions.generateReply` |
| `convex/ai_zone/channels/whatsapp/actions.ts` | Runs the public orchestrator and persists responses. | `ai_zone/assistant` (internal) |

## Durable Workflow

| Location | What It Does | API Target |
|---|---|---|
| `convex/ai_zone/agents/shared/workflows.ts` | Replays messages and calls assistant actions asynchronously. | `ai_zone/assistant.sendMessage` |

## Service Layer

| Location | What It Does |
|---|---|
| `convex/ai_zone/services/assistantService.ts` | Core logic: resolve identity, build prompt, orchestrate, persist. |

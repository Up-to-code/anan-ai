# ai_zone Zone (Backend)

## Ownership
This folder owns AI assistant logic, agent definitions, and orchestration.

## Architecture

### Thin Controller
- `assistant.ts` — Public Convex endpoints: `getThread`, `getThreadSafe`, `listMessages`, `listMessagesSafe`, `sendMessage`, `streamMessage`, `_saveConversationStep`

### Services
- `services/assistantService.ts` — All business logic: identity resolution, thread operations, message orchestration, conversation persistence

### Agents
- `agents/orchestration/` — Main agent runner
- `agents/anan_lit/` — Core Anan agent definitions
- `agents/zone_assistants/` — Role-specific assistants (broker, RED)
- `agents/runtime/` — Agent runtime utilities
- `agents/search/` — Search integrations
- `agents/scraping/` — Data scraping agents
- `agents/actions/` — Agent action definitions

### Channels
- `channels/` — Multi-channel delivery (WhatsApp, app, etc.)

## Rules
1. `assistant.ts` is a **Thin Controller** — it must only declare endpoints and delegate.
2. All complex logic lives in `services/assistantService.ts`.
3. No cross-zone DB access. Use `shared_logic` for shared data.

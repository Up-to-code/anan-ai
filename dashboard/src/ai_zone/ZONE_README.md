# ai_zone Zone

## Ownership
This folder owns AI assistant features only.

## Public API (Frontend)
- `pages/AssistantPage.tsx` — Entry page (thin container)
- `hooks/useAssistantChat.ts` — Data layer (the only place that calls Convex APIs)
- `components/ChatMessageList.tsx` — Scrollable conversation container with auto-scroll
- `components/ChatBubble.tsx` — Message bubbles with avatars, reasoning, and sources
- `components/ChatInput.tsx` — Auto-resizing prompt input

## Public API (Backend)
- `assistant.ts` — Thin Controller (queries, actions, internal mutations)
- `services/assistantService.ts` — Business logic, identity resolution, orchestration
- `agents/` — AI agent definitions, runtime, search, scraping, and orchestration

## Architecture Rules
- **Page → Hook → Backend.** The page only renders UI and delegates to the hook.
- **Backend Thin Controller → Service.** `assistant.ts` delegates all logic to `services/`.
- **No cross-zone imports.** Use `shared_logic` for anything reusable across zones.

## Allowed Imports
- Same zone modules.
- Core infrastructure (`@/_core/lib/utils`, `@/_core/hooks/*`).
- Shared logic modules for reusable domain logic.

## Forbidden
- Deep imports from another feature zone.
- Duplicating business logic that already exists in shared modules.
- Inline API calls in page components.

## Examples
- Good: `AssistantPage` → `useAssistantChat` → `api.ai_zone.assistant.*`
- Bad: Page imports Convex `useQuery` directly or imports from `broker_zone`.

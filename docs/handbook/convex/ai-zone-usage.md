# AI Zone Usage Guide (Non-AI-Zone Teams)

This guide explains how teams outside `ai_zone` can use the assistant APIs from UI, server code, or CLI. It focuses on integration, not internal orchestration details.

---

## Choose the Correct Assistant

| Assistant | Use When | Convex Module |
|---|---|---|
| Public assistant | End-user flows and general inquiries. | `ai_zone/assistant` |
| Workspace assistant | Partner operations, brokers, developers, admins. | `ai_zone/assistantWorkspace` |
| Workspace compatibility alias | Legacy callers of “pro”. | `ai_zone/assistantPro` |

---

## Public Assistant API Surface

Module: `convex/ai_zone/assistant.ts`

Queries:
- `getThread` and `getThreadSafe`
- `listMessages`
- `listThreads`

Actions:
- `sendMessage`
- `streamMessage`

---

## Workspace Assistant API Surface

Module: `convex/ai_zone/assistantWorkspace.ts`

Queries:
- `getThread` and `getThreadSafe`
- `listMessages`
- `listThreads`

Actions:
- `sendMessage`

Workspace responses may include `metadata.uiTurn` for UI cards.

---

## Server Usage Pattern (Next.js example)

Reference: `/Users/ahmedmansour/anan-lit/apps/web/server/infrastructure/convex/ananProRepository.ts`

```ts
import { fetchAction, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

const api = apiUnsafe["ai_zone/assistantWorkspace"];

export async function sendWorkspaceMessage(token: string, message: string, threadId?: string) {
  const response = await fetchAction(api.sendMessage as never, { message, threadId } as never, {
    token,
  });

  const messages = await fetchQuery(api.listMessages as never, { threadId: response.threadId } as never, {
    token,
  });

  return messages;
}
```

---

## Client Usage Pattern (Convex React)

If your surface uses the Convex client:
- Use the generated `api` from `convex/_generated/api`.
- Call `api.ai_zone.assistant.sendMessage` for public flows.
- Call `api.ai_zone.assistantWorkspace.sendMessage` for workspace flows.

---

## CLI Usage (Linux or Local Dev)

If you have the Convex CLI:

```bash
npx convex run ai_zone/assistant:sendMessage --args '{"message":"Search apartments in Riyadh","threadId":null}'
```

For workspace:

```bash
npx convex run ai_zone/assistantWorkspace:sendMessage --args '{"message":"Draft a new project","threadId":null}'
```

---

## Thread and Message Model

Stored in `assistantThreads` and `assistantMessages`:
- Threads track owner type, assistant kind, mode, and timestamps.
- Messages store role (`user` or `assistant`), content, and optional metadata.

Workspace UI can render `metadata.uiTurn` for cards such as draft actions.

---

## Access and Role Mapping

The assistant maps authenticated user profiles to roles:
- Broker → `broker`
- Developer → `RED`
- Normal user → `user`

This mapping controls which teams and tools are available.

---

## Integration Checklist

- Use the correct assistant module (`assistant` vs `assistantWorkspace`).
- Pass `threadId` when continuing a conversation.
- Use `listMessages` to rebuild conversation history.
- Expect `metadata.uiTurn` in workspace responses when a structured card is available.

# AI Zone Usage (Public vs Workspace)

## Choose the Assistant

| Assistant | Use When | Convex Module |
|---|---|---|
| Public assistant | End-user flows and general inquiries | `ai_zone/assistant` |
| Workspace assistant | Partner operations and internal workflows | `ai_zone/assistantWorkspace` |
| Workspace alias | Legacy integrations | `ai_zone/assistantPro` |

## Next.js Server Usage

Reference implementation:
- `apps/web/server/infrastructure/convex/ananProRepository.ts`

Example:

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

## Convex Client Usage (Frontend)

```ts
import { useAction, useQuery } from "convex/react";
import { api } from "convex/_generated/api";

const sendMessage = useAction(api.ai_zone.assistant.sendMessage);
const listMessages = useQuery(api.ai_zone.assistant.listMessages, { threadId });

await sendMessage({ message: "Search apartments in Riyadh", threadId });
```

## CLI Usage

Public assistant:

```bash
npx convex run ai_zone/assistant:sendMessage --args '{"message":"Search apartments in Riyadh"}'
```

Workspace assistant:

```bash
npx convex run ai_zone/assistantWorkspace:sendMessage --args '{"message":"Draft a new project"}'
```

## Expected Runtime Behavior

- `assistant` is for public user flows.
- `assistantWorkspace` injects a workspace prompt prefix and may return UI card metadata.
- Both persist threads and messages automatically.

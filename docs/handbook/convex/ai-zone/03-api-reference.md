# API Reference (Parameters, Returns, Examples)

This section documents assistant-facing APIs and the WhatsApp action.

## Public Assistant API (`ai_zone/assistant`)

### `getThread`

**Args**

| Name | Type | Required | Description |
|---|---|---|---|
| none | — | — | No parameters. Requires auth. |

**Returns**

| Field | Type | Description |
|---|---|---|
| `thread` | `assistantThreads \| null` | Latest thread for the user or `null`. |
| `owner` | `{ userId, ownerType, ownerBrokerId?, ownerREDId? }` | Resolved owner identity. |

**Notes**

- Throws if unauthenticated.

### `getThreadSafe`

**Args**

| Name | Type | Required | Description |
|---|---|---|---|
| none | — | — | No parameters. Safe if unauthenticated. |

**Returns**

| Field | Type | Description |
|---|---|---|
| `thread` | `assistantThreads \| null` | Latest thread or `null`. |
| `owner` | `null \| { userId, ownerType, ownerBrokerId?, ownerREDId? }` | `null` if unauthenticated. |

### `listMessages`

**Args**

| Name | Type | Required | Description |
|---|---|---|---|
| `threadId` | `Id<"assistantThreads">` | No | If omitted, uses latest thread. |

**Returns**

Array of `assistantMessages` documents.

Key fields:

| Field | Type | Description |
|---|---|---|
| `_id` | `Id<"assistantMessages">` | Message id. |
| `threadId` | `Id<"assistantThreads">` | Thread id. |
| `role` | `"user" \| "assistant"` | Message role. |
| `content` | `string` | Message text. |
| `mode` | `"qa" \| "action"` | Mode used for this message. |
| `metadata` | `object \| undefined` | Optional metadata. |
| `createdAt` | `number` | Timestamp. |

### `listThreads`

**Args**

| Name | Type | Required | Description |
|---|---|---|---|
| `limit` | `number` | No | Defaults to `6`. |

**Returns**

Array of `assistantThreads` documents for the public assistant.

Key fields:

| Field | Type | Description |
|---|---|---|
| `_id` | `Id<"assistantThreads">` | Thread id. |
| `title` | `string \| undefined` | Thread title. |
| `updatedAt` | `number` | Timestamp. |
| `mode` | `"qa" \| "action"` | Mode. |
| `assistantKind` | `"default"` | Assistant kind for public flows. |

### `sendMessage`

**Args**

| Name | Type | Required | Description |
|---|---|---|---|
| `message` | `string` | Yes | User prompt. |
| `threadId` | `Id<"assistantThreads">` | No | Append to an existing thread. |

**Returns**

| Field | Type | Description |
|---|---|---|
| `ok` | `true` | Always true on success. |
| `threadId` | `string` | Thread id used or created. |
| `mode` | `"qa" \| "action"` | Assistant mode derived from entitlement. |
| `output` | `string` | Assistant response text. |
| `messageId` | `string` | Assistant message id. |

### `streamMessage`

Same arguments and return shape as `sendMessage`. It currently returns a full response; UI handles streaming playback.

---

## Workspace Assistant API (`ai_zone/assistantWorkspace`)

All endpoints mirror the public assistant but target `assistantKind = "anan_workspace"` and apply a workspace prompt prefix.

### `getThread` and `getThreadSafe`

Same arguments and return shapes as the public assistant, but the thread filter uses the workspace assistant kind.

### `listMessages`

Same arguments and return shapes as the public assistant. Workspace messages may include `metadata.uiTurn` for structured UI cards.

### `listThreads`

Same arguments and return shapes as the public assistant, but filtered to workspace threads.

### `sendMessage`

Same arguments and return shape as the public assistant.

---

## WhatsApp Action API (`ai_zone/channels/whatsapp/actions.ts`)

### `generateReply`

**Args**

| Name | Type | Required | Description |
|---|---|---|---|
| `userId` | `string` | Yes | WhatsApp user id. |
| `message` | `string` | Yes | Normalized text. |
| `displayName` | `string` | No | Optional display name. |
| `threadId` | `string` | No | Optional existing thread id. |

**Returns**

| Field | Type | Description |
|---|---|---|
| `ok` | `true` | Always true on success. |
| `text` | `string` | Assistant response text. |
| `threadId` | `string \| undefined` | Thread id used or created. |

---

## Examples

### Public assistant via server

```ts
import { fetchAction } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

const api = apiUnsafe["ai_zone/assistant"];
const result = await fetchAction(api.sendMessage as never, {
  message: "Find me a 3-bedroom apartment",
  threadId: undefined,
} as never);
```

### Workspace assistant via server

```ts
import { fetchAction } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

const api = apiUnsafe["ai_zone/assistantWorkspace"];
const result = await fetchAction(api.sendMessage as never, {
  message: "Draft a new project with 4BR units",
  threadId: undefined,
} as never);
```

### CLI

```bash
npx convex run ai_zone/assistant:sendMessage --args '{"message":"Search apartments in Riyadh"}'
```

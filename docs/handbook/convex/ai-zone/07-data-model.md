# Data Model (AI Zone)

This section summarizes the core tables used by AI zone.

## `assistantThreads`

Location: `convex/_core/schema/knowledge.ts`

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Auth user id. |
| `ownerType` | `"broker" \| "RED" \| "user"` | Role derived from profile. |
| `ownerBrokerId` | `Id<"brokers"> \| undefined` | Broker id for broker owners. |
| `ownerREDId` | `Id<"RED"> \| undefined` | Developer id for RED owners. |
| `mode` | `"qa" \| "action"` | QA or action mode. |
| `assistantKind` | `"default" \| "anan_workspace" \| "anan_pro"` | Assistant type. |
| `orchestratorName` | `string \| undefined` | Orchestrator analytics name. |
| `title` | `string \| undefined` | Thread title. |
| `createdAt` | `number` | Timestamp. |
| `updatedAt` | `number` | Timestamp. |

## `assistantMessages`

Location: `convex/_core/schema/knowledge.ts`

| Field | Type | Description |
|---|---|---|
| `threadId` | `Id<"assistantThreads">` | Parent thread. |
| `role` | `"user" \| "assistant"` | Message role. |
| `content` | `string` | Message text. |
| `mode` | `"qa" \| "action"` | Mode at time of message. |
| `metadata` | `any \| undefined` | Optional UI data, e.g., `uiTurn`. |
| `createdAt` | `number` | Timestamp. |

## `aiTokenUsage`

Location: `convex/_core/schema/ai.ts`

| Field | Type | Description |
|---|---|---|
| `agentName` | `string` | Agent that invoked the model. |
| `teamName` | `string \| undefined` | Team name. |
| `promptVersion` | `string \| undefined` | Prompt version. |
| `modelName` | `string` | LLM model id. |
| `inputTokens` | `number` | Input tokens. |
| `outputTokens` | `number` | Output tokens. |
| `estimatedCostUSD` | `number \| undefined` | Estimated cost. |
| `userId` | `string \| undefined` | Triggering user. |
| `threadId` | `string \| undefined` | Thread id. |
| `channel` | `string \| undefined` | Channel name. |
| `role` | `string \| undefined` | Role used for access. |
| `errorOccurred` | `boolean \| undefined` | Whether a call failed. |
| `createdAt` | `number` | Timestamp. |

## `aiOrchestrationUsage`

Location: `convex/_core/schema/ai.ts`

| Field | Type | Description |
|---|---|---|
| `orchestratorName` | `string` | Orchestrator identifier. |
| `role` | `string` | Role used in orchestration. |
| `channel` | `string \| undefined` | Channel name. |
| `userId` | `string \| undefined` | Triggering user. |
| `threadId` | `string \| undefined` | Thread id. |
| `agentsDispatched` | `string[]` | Dispatched agents. |
| `successfulAgents` | `string[]` | Agents that succeeded. |
| `failedAgents` | `string[]` | Agents that failed. |
| `totalInputTokens` | `number` | Aggregate input tokens. |
| `totalOutputTokens` | `number` | Aggregate output tokens. |
| `createdAt` | `number` | Timestamp. |

## `aiRAGEntries`

Location: `convex/_core/schema/ai.ts`

| Field | Type | Description |
|---|---|---|
| `ragType` | `"production" \| "recommendation"` | Namespace. |
| `title` | `string` | Title label. |
| `content` | `string` | Training content. |
| `category` | `string \| undefined` | Category. |
| `target` | `"user" \| "broker" \| "RED" \| "all"` | Audience target. |
| `status` | `"pending" \| "approved" \| "rejected"` | Review status. |
| `suggestedBy` | `string \| undefined` | Agent that suggested. |
| `reviewedBy` | `string \| undefined` | Admin reviewer. |
| `createdAt` | `number` | Timestamp. |
| `reviewedAt` | `number \| undefined` | Timestamp. |

## `userKnowledgeBase`

Location: `convex/_core/schema/ai.ts`

| Field | Type | Description |
|---|---|---|
| `userId` | `string` | User id. |
| `key` | `string` | Knowledge key. |
| `summary` | `string` | Human summary. |
| `value` | `any` | Structured data. |
| `importance` | `number` | 0 to 1. |
| `source` | `string` | Agent name. |
| `createdAt` | `number` | Timestamp. |
| `updatedAt` | `number` | Timestamp. |

## `agentMemory`

Location: `convex/_core/schema/knowledge.ts`

Stores long-lived memory facts, preferences, and interactions.

## `knowledgePages` and `developerHandbookPages`

Location: `convex/_core/schema/knowledge.ts`

Used by knowledge agents and platform docs agents.

## `entityRelations`

Location: `convex/_core/schema/knowledge.ts`

Stores graph links between entities for advanced knowledge modeling.

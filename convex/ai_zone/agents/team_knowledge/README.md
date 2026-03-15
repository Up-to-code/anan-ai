# team_knowledge

## Purpose
RAG context retrieval and per-user memory management.

## Agents
| Agent | Description |
|-------|------------|
| `anan_knowledge` | Searches production RAG for trained context |
| `anan_memory` | Manages per-user knowledge base (preferences, budget, areas) |

## Role Access
Available to: **User**, **Broker**, **RED**, **Admin**

## RAG Namespaces
- `rag_production` → Used by `anan_knowledge` (confirmed data)
- `kb_{userId}` → Used by `anan_memory` (personal memory)

## How to Edit
- To change RAG search parameters → edit `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- To change what gets remembered → edit `convex/ai_zone/agents/anan/orchestrationConfig.ts`

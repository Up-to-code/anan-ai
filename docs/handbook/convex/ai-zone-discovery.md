# AI Zone Discovery Guide (Prompts, Tools, Agents)

This guide shows where prompts, tools, and agent definitions live, and how to locate them quickly.

---

## Where Prompts Live

All canonical prompts are declared inside the orchestration configs:
- `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- `convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts`

Look for the `prompt` block on each agent definition. Shared safety text is defined in:
- `convex/ai_zone/agents/core/promptPolicy.ts`

---

## Where Tools Live

Tools are registered in the orchestrator tool catalog:
- `convex/ai_zone/agents/anan/orchestrationConfig.ts` (`TOOL_CATALOG`)
- `convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts` (`TOOL_CATALOG`)

Tool factories live in team folders:
- `convex/ai_zone/agents/team_search/*/tools/*`
- `convex/ai_zone/agents/team_property/tools/*`
- `convex/ai_zone/agents/team_finance/tools/*`
- `convex/ai_zone/agents/team_knowledge/tools/*`
- `convex/ai_zone/agents/team_platform/tools/*`
- `convex/ai_zone/agents/team_trainer/tools/*`

---

## Where Agents and Teams Are Defined

Agent and team registries live in the orchestrator config files:
- `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- `convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts`

Team resolution and role gating happen in:
- `convex/ai_zone/agents/anan/teamRegistry.ts`
- `convex/ai_zone/agents/anan_workspace/teamRegistry.ts`

---

## How to Search Prompts and Tools Fast

From the repo root:

```bash
rg -n "prompt:" convex/ai_zone/agents/anan/orchestrationConfig.ts
```

```bash
rg -n "toolKeys" convex/ai_zone/agents/anan/orchestrationConfig.ts
```

```bash
rg -n "TOOL_CATALOG" convex/ai_zone/agents/anan/orchestrationConfig.ts
```

```bash
rg -n "defineAgentConfig" convex/ai_zone/agents/anan/orchestrationConfig.ts
```

---

## Registry Validation Rules

Validation and safety checks are centralized in:
- `convex/ai_zone/agents/core/registry.ts`

Key validations enforced:
- Prompt blocks must be non-empty.
- Agent names must be unique.
- Tool keys must exist in the catalog.
- Teams must own the agents they list.
- Model overrides must exist in the model catalog.

---

## RAG and Memory Discovery

RAG namespaces and filters are defined in:
- `convex/ai_zone/agents/shared/ragInstances.ts`

RAG entry creation is handled by:
- `convex/ai_zone/agents/shared/ragActions.ts`

---

## Token and Orchestration Analytics

Tracking logic:
- `convex/ai_zone/agents/shared/tokenTracker.ts`
- `convex/ai_zone/agents/shared/orchestrationTracker.ts`

Schema:
- `convex/_core/schema/ai.ts`

# Agents and Prompts

## Where Prompts Live

Canonical prompt definitions are inside the orchestrator configs:

- `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- `convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts`

Shared prompt safety text is in:

- `convex/ai_zone/agents/core/promptPolicy.ts`

## Prompt Schema

Each agent uses a structured prompt definition:

```ts
export type PromptDefinition = {
  version: string;
  identity: string;
  scope: string[];
  toolUsage: string[];
  output: string[];
  safety: string[];
  extra?: { key: string; content: string }[];
};
```

## Example Agent Prompt

```ts
export const ananSearchDefinition = defineAgent({
  name: "anan_search",
  description: "Searches properties by criteria and returns listings.",
  team: "team_search",
  allowedRoles: ["user", "broker", "admin"],
  prompt: {
    version: "v2",
    identity: "أنت anan_search، وكيل البحث العقاري الأساسي في منصة عنان.",
    scope: ["البحث في العقارات حسب المنطقة والسعر والنوع."],
    toolUsage: ["استخدم أدوات البحث والسياق المتاحة فقط."],
    output: ["قدّم 3 إلى 5 نتائج كحد أقصى."],
    safety: [
      SHARED_PROMPT_BLOCKS.arabicStandard,
      SHARED_PROMPT_BLOCKS.noFabrication,
      SHARED_PROMPT_BLOCKS.businessPolicy,
    ],
  },
});
```

## How to Find Prompts Quickly

```bash
rg -n "prompt:" convex/ai_zone/agents/anan/orchestrationConfig.ts
```

```bash
rg -n "prompt:" convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts
```

## Where Agents Are Registered

- `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- `convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts`

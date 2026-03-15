# Tools, Registries, and Validation

## Tool Catalogs

Tool catalogs are defined per orchestrator:

- `convex/ai_zone/agents/anan/orchestrationConfig.ts`
- `convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts`

Each tool entry includes a key, description, and factory.

## Tool Factory Locations

Tool factories live inside team folders:

- `convex/ai_zone/agents/team_search/*/tools/*`
- `convex/ai_zone/agents/team_property/tools/*`
- `convex/ai_zone/agents/team_finance/tools/*`
- `convex/ai_zone/agents/team_knowledge/tools/*`
- `convex/ai_zone/agents/team_platform/tools/*`
- `convex/ai_zone/agents/team_trainer/tools/*`

## Registry Helpers and Validation

Registry helpers live in:

- `convex/ai_zone/agents/core/registry.ts`

Validations enforced:

- Prompt sections must be non-empty.
- Tool keys must exist in the tool catalog.
- Agent names must be unique.
- Team id must match agent `team` field.
- Model override must exist in the model catalog.

## Example Tool Registration

```ts
export const TOOL_CATALOG = defineTools({
  search_smart_property: {
    key: "search_smart_property",
    description: "Search properties across internal data.",
    factory: smartPropertySearch,
  },
});
```

## Example Agent Tool Usage

```ts
export const ananSearchDefinition = defineAgent({
  name: "anan_search",
  team: "team_search",
  toolKeys: ["search_smart_property"],
  // ...prompt and policy...
});
```

## Lookup Commands

```bash
rg -n "TOOL_CATALOG" convex/ai_zone/agents/anan/orchestrationConfig.ts
```

```bash
rg -n "toolKeys" convex/ai_zone/agents/anan/orchestrationConfig.ts
```

# Backend Multi-Agent Orchestrator

The AI architecture has been fully refactored away from a central monolith into a strictly specialized hierarchical team structure.

## Topology

The logic lives in `convex/ai_zone/agents`.

```text
ai_zone/agents/
├── anan/                      <-- The Orchestrator (The "Brain")
├── shared/                    <-- Base classes and utilities (AnanAgent.ts)
├── team_search/               <-- Team: Data Retrieval
│   ├── anan_search/           <-- Agent
│   ├── anan_web/              <-- Agent
│   └── tools/                 <-- Tools scoped only to this team
├── team_property/             <-- Team: Real Estate logic
├── team_finance/              <-- Team: Financial calculation
└── team_knowledge/            <-- Team: Context retrieval
```

## The "anan" Orchestrator

The `assistantService.ts` entry point must never run an agent directly. It always delegates to `orchestrate.ts` located in `agents/anan/`.

1. **Intent Analysis**: (`intentAnalyzer.ts`) The brain classifies the user's prompt using a fast model to determine which specialized agents are required.
2. **Team Dispatch**: The orchestrator checks `teamRegistry.ts` to locate the required agents, and instantiates them.
3. **Execution**: The agents run in parallel or sequence, utilizing their scoped `tools/`.
4. **Result Merging**: (`resultMerger.ts`) Multiple outputs are synthesized into a coherent markdown response.

## Adding a New Agent

1. **Identify the Team:** Does it belong to `team_search`? Or a new team?
2. **Create the Folder:** e.g., `team_search/anan_new_agent/`.
3. **Provide Config:** Create `config.ts`, exporting an initialization of the `AnanAgent` base class. You MUST define its `name`, `systemPrompt`, `model`, and `tools`.
4. **Register:** Add the agent string and module mapping to `teamRegistry.ts`.

## Robustness Requirements

- **NEVER** write a raw external network call without using `errorHandler.ts` for exponential backoff.
- **NEVER** bypass `tokenTracker.ts`. All LLM calls must log their token usage to the `aiTokenUsage` Convex table for cost tracking.

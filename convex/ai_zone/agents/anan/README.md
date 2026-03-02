# anan/ — The Brain (Main Orchestrator)

## Purpose
This folder contains the main orchestrator that receives user messages,
decides which teams/agents to dispatch, runs them in parallel, and merges
results into a coherent response.

## Files
| File | Purpose |
|------|---------|
| `index.ts` | Public API — exports `orchestrate()` |
| `orchestrate.ts` | Main orchestration logic (the 7-step lifecycle) |
| `intentAnalyzer.ts` | LLM-based intent classification → team selection |
| `resultMerger.ts` | Merging multi-agent outputs into one response |
| `teamRegistry.ts` | TEAM_REGISTRY + ROLE_ACCESS configuration |
| `types.ts` | TypeScript type definitions |

## How It Works
```
orchestrate(input)
  → getAvailableTeams(role)     ← from teamRegistry.ts
  → analyzeIntent(prompt)       ← from intentAnalyzer.ts
  → getTeamAgents(teams)        ← from teamRegistry.ts
  → Promise.allSettled(agents)  ← parallel execution
  → collectResults(settled)     ← from resultMerger.ts
  → mergeResults(outputs)       ← from resultMerger.ts
  → ananTrainer.run(bg)         ← fire-and-forget
  → return OrchestrateOutput
```

## How to Edit
- **Add a team/agent**: Edit `teamRegistry.ts`
- **Change intent detection**: Edit `intentAnalyzer.ts`
- **Change how outputs merge**: Edit `resultMerger.ts`
- **Change the dispatch flow**: Edit `orchestrate.ts`

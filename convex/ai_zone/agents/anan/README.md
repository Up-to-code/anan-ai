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
| `teamRegistry.ts` | Team definitions and role-aware registry lookup |
| `types.ts` | TypeScript type definitions |

## How It Works
```
orchestrate(input)
  → getAvailableTeams(role)     ← from teamRegistry.ts
  → analyzeIntent(ctx, prompt)  ← from intentAnalyzer.ts
  → getTeamAgents(teams)        ← from teamRegistry.ts via shared agent factory
  → Promise.allSettled(agents)  ← parallel execution
  → collectResults(settled)     ← from resultMerger.ts
  → mergeResults(ctx, outputs)  ← from resultMerger.ts
  → trainer definition via factory (bg)
  → return OrchestrateOutput
```

## How to Edit
- **Add a team/agent**: Edit `teamRegistry.ts`
- **Change intent detection**: Edit `intentAnalyzer.ts`
- **Change how outputs merge**: Edit `resultMerger.ts`
- **Change the dispatch flow**: Edit `orchestrate.ts`

# anan_workspace/ — Workspace Orchestrator

## Purpose
This folder contains the workspace orchestrator that receives workspace messages,
selects workspace teams, runs them in parallel, and merges results into one response.

## Files
| File | Purpose |
|------|---------|
| `index.ts` | Public API — exports `orchestrate()` |
| `orchestrate.ts` | Workspace orchestration logic |
| `intentAnalyzer.ts` | Workspace intent classification → team selection |
| `resultMerger.ts` | Merging multi-agent outputs into one response |
| `teamRegistry.ts` | Team definitions and role-aware registry lookup |
| `types.ts` | TypeScript type definitions |
| `orchestrationConfig.ts` | Centralized workspace agent + team configuration |

## How to Edit
- **Add a team/agent**: Edit `orchestrationConfig.ts`
- **Change intent detection**: Edit `intentAnalyzer.ts`
- **Change how outputs merge**: Edit `resultMerger.ts`
- **Change the dispatch flow**: Edit `orchestrate.ts`

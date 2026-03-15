# Recipe: Add a new AI agent (team-based)

---

## WHY

The AI system is multi-agent and team-based. Adding a new agent must not:

- bypass the orchestrator,
- duplicate tools that already exist,
- or break tracking and error handling.

---

## WHAT

Step-by-step for adding an agent under:

`convex/ai_zone/agents/team_*/` (public)
`convex/ai_zone/agents/team_workspace_*/` (partner workspace)

and registering it in the appropriate orchestrator config.

---

## HOW (Steps)

1. **Choose the right team**
   - If an existing team matches the capability, add the agent there.
   - If not, create a new team folder deliberately.

2. **Create the agent folder**
   - Public: `convex/ai_zone/agents/team_<team>/<agentName>/`
   - Workspace: `convex/ai_zone/agents/team_workspace_<team>/<agentName>/`
   - Define config and prompt policy consistent with the team.

3. **Add or reuse tools**
   - Tools live under `team_<team>/tools/*`.
   - Tools must enforce access/ownership when reading data.

4. **Register the agent**
   - Public: add to `convex/ai_zone/agents/anan/orchestrationConfig.ts`.
   - Workspace: add to `convex/ai_zone/agents/anan_workspace/orchestrationConfig.ts`.
   - Ensure the orchestrator can dispatch it by intent/role.

5. **Wire shared helpers**
   - Use shared error handler and tracking helpers under `convex/ai_zone/agents/shared/*`.

6. **Add tests where feasible**
   - At minimum: tool unit tests and any deterministic logic tests.

---

## Common pitfalls

- Calling tools directly from the orchestrator instead of from the agent.
- Adding a tool that scans large tables without indexes.
- Logging full prompt context.

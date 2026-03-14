# LLM Data Access (Current Reality + Safe Rules)

---

## WHY

Not every “AI-shaped” feature in this repo uses the full multi-agent orchestrator, and not every table is safe context for an LLM.

This chapter prevents accidental data leakage and prompts that scale poorly.

---

## WHAT

1. Summarizes the current AI surfaces and what context they use.
2. Defines safe context assembly rules.
3. Points to the canonical detailed reference.

---

## HOW

### Current AI surfaces (summary)

- Workspace assistant: `convex/ai_zone/assistant.ts` → `convex/ai_zone/services/assistantService.ts` → orchestrator.
- WhatsApp channel: `convex/http.ts` → `convex/ai_zone/channels/whatsapp/*` → internal action.
- Mobile assistant: `convex/user_zone/mobile/assistant.ts` (deterministic card builder, not the orchestrator).
- Platform/docs agent: `convex/ai_zone/agents/team_platform/*` (workspace engineers only; secret-free developer handbook).

### Safe context rules

1. Resolve identity and mode before gathering context.
2. Inject only minimal structured context (typed projections).
3. Avoid “full table dumps”.
4. Treat knowledge sources as explicitly scoped; do not claim tenant-scoping if it is not implemented.
5. Persist enough metadata to debug failures, but do not log PII.
6. Keep developer handbook knowledge separate from user/company knowledge unless role-gated explicitly.

### Canonical reference

Read the full guide:

- `docs/llm-data-access-guide.md`

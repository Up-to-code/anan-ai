# LLM Onboarding (Fast Map)

This folder exists so an LLM (or a new engineer) can understand this codebase quickly **without inventing architecture**.

---

## Read first (in order)

1. `ARCHITECTURE.md`
2. `CONVEX_RULES.md`
3. `docs/handbook/README.md`
4. `docs/handbook/security/README.md`

---

## What not to do

- Do not create new folder conventions.
- Do not put business logic inside route files or HTTP/webhook handlers.
- Do not deep-import across zones.
- Do not scan tables with `collect()` when the table can grow.
- Do not use `take(N)` to find “the recipient/target”.
- Do not log raw prompts, webhook bodies, or PII.

---

## Quick links

- System map: `llm/SYSTEM_MAP.md`
- Security checklist: `llm/SECURITY_CHECKLIST.md`
- Where code goes: `llm/CHANGE_PLACEMENT.md`


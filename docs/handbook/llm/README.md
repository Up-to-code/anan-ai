# LLM / Agent Contribution Rules

---

## WHY

LLMs are fast, but they are also “pattern amplifiers”. If an LLM copies a bad pattern once, it spreads it everywhere.

This repo explicitly requires strict architecture to prevent drift.

---

## WHAT

Rules for any LLM/human making changes:

- what to read first,
- where to add code,
- what not to touch without deliberate intent,
- how to keep the system safe and consistent.

---

## HOW (Non-negotiable rules)

### Before writing code, read:

1. `ARCHITECTURE.md`
2. `CONVEX_RULES.md`
3. The relevant zone’s `ZONE_README.md`
4. The nearest existing module that already owns the capability

### Do not:

- invent new folder conventions,
- bypass access checks “because it works”,
- scan tables and filter in JS,
- add `"use client"` to whole pages for convenience,
- write business logic inside route handlers or webhook handlers,
- log raw prompts/PII to console.

### Always:

- keep entrypoints thin,
- enforce ownership invariants,
- push aggregation into summary queries,
- document exports with WHY/WHAT/HOW (JSDoc for code; headings for docs),
- add tests when changing invariants.

---

## Where to find “source of truth”

- Backend truth: `convex/**`
- Web gateway truth: `apps/web/server/**`
- Admin docs truth: in-app `/docs` backed by `apps/admin/admin_zone/pages/DocsPage/**`
- Deep docs truth: `docs/handbook/**`

## Reusable prompts

- `docs/handbook/llm/anan-platform-slide-prompt.md` — source resource and compact handoff prompt for generating Anan platform slide decks for developer-facing presentations

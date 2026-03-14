# Developer Bible v1 (Convex-first)

This handbook is the **canonical, deep** explanation of how the Anan platform codebase works and how to extend it safely.

It is written for:

- human developers onboarding into the repo, and
- LLMs/agents that need strict rules to avoid architectural drift.

The **backend (Convex)** is treated as the primary source of truth. Every frontend surface is “a client of Convex”, either directly or through a server gateway.

---

## WHY

Anan is a multi-surface platform (web + admin + mobile + channels) with one shared backend. Without a single “Bible”, teams:

- duplicate business logic across apps,
- bypass ownership rules,
- add slow scans and list-then-reduce aggregations,
- turn channel webhooks into non-idempotent “god handlers”,
- ship UI layers that accidentally require client JS everywhere.

---

## WHAT

This handbook explains:

- the four runtime surfaces (web, admin, mobile, channels),
- the Convex zone architecture (core + shared logic + AI + owner zones),
- the web server gateway layer (`apps/web/server/**`),
- how to add new tables, domains, channels, and agents,
- the “God rules” for where code must live and how it must be written.

This handbook is **docs-only**: it describes enforcement, but does not add automated enforcement in this version.

---

## HOW (Reading Order)

### 1) Mandatory first reads

1. `ARCHITECTURE.md`
2. `CONVEX_RULES.md`
3. `docs/developer-system-guide.md`
4. `docs/codebase-knowledge-base.md`

### 2) Handbook chapters (deep)

#### Convex (Primary)

- `docs/handbook/convex/README.md` — mental model + zone map
- `docs/handbook/convex/core.md` — `_core` responsibilities and rules
- `docs/handbook/convex/schema.md` — schema, indexes, naming rules
- `docs/handbook/convex/zones.md` — what belongs where (with examples)
- `docs/handbook/convex/shared-logic.md` — capability patterns for shared logic
- `docs/handbook/convex/ai-zone.md` — orchestrator, teams, tools, persistence
- `docs/handbook/convex/channels.md` — channel adapters (WhatsApp blueprint)
- `docs/handbook/convex/http-and-oauth.md` — HTTP routing + OAuth endpoints

#### Web (Workspace + Public)

- `docs/handbook/web/README.md`
- `docs/handbook/web/app-router.md`
- `docs/handbook/web/server-gateway.md`
- `docs/handbook/web/ssr-performance.md`
- `docs/handbook/web/api-routes.md`

#### Admin (Operations Console)

- `docs/handbook/admin/README.md`
- `docs/handbook/admin/in-app-docs.md`

#### Mobile (Buyer App)

- `docs/handbook/mobile/README.md`
- `docs/handbook/mobile/architecture.md`
- `docs/handbook/mobile/convex-wiring.md`

#### LLM / Agent Rules

- `docs/handbook/llm/README.md`
- `docs/handbook/llm/data-access.md`

#### Recipes (Decision-complete “how to add”)

- `docs/handbook/recipes/add-table.md`
- `docs/handbook/recipes/add-web-domain.md`
- `docs/handbook/recipes/add-channel.md`
- `docs/handbook/recipes/add-agent.md`

### 3) Shared glossary

- `docs/handbook/glossary.md`

---

## Surfaces and “the circle”

At runtime, Anan is a loop:

1. A **surface** receives input (web/admin/mobile/WhatsApp).
2. The surface delegates to an owning layer (web gateway or direct Convex).
3. Convex resolves identity + access policy.
4. Convex executes a capability (shared logic, AI, owner zone).
5. Convex persists state, emits projections, and returns data.
6. The surface renders, and often subscribes to updates (real-time).

If a change breaks the loop, it breaks the platform.

---

## “God rules” (repo-wide)

1. **Thin entrypoints:** route files and HTTP handlers must be thin.
2. **Zone ownership:** put logic where it belongs; do not duplicate.
3. **Contracts at boundaries:** normalize naming (e.g., `REDId` → `redId`) only at explicit contract boundaries.
4. **Index-first + pagination:** no table scans, no `take(N)` correctness traps.
5. **Idempotent channels:** webhooks must survive retries.
6. **WHY/WHAT/HOW everywhere:** exported modules must explain why they exist, what they do, how they work.


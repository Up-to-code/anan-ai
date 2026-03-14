# CONVEX_RULES — “God Rules” for the Backend

This repository uses **Convex as the backend runtime** for schema, access control, shared business logic, AI orchestration, and multi-channel ingestion.

These rules apply to **every** file under `convex/` and to any client/server layer calling Convex.

If you only read one thing before adding a query/mutation/action: read this file and `ARCHITECTURE.md`.

---

## WHY

Convex is the single source of truth for:

- persisted data (tables + indexes),
- identity and access policy,
- real-time domain capabilities (offers, inbox, properties, market),
- AI orchestration and channel adapters.

Without strict rules, teams accidentally:

- duplicate logic across zones,
- bypass access policy,
- introduce slow “scan everything then filter” queries,
- break ownership invariants (broker vs developer/RED vs user),
- ship channel handlers that are not idempotent.

---

## WHAT

This document defines:

1. **Zone boundaries** and allowed imports.
2. The correct use of **queries vs mutations vs actions vs httpAction**.
3. **Identity + ownership rules** (including `RED` vs `developer` naming).
4. **Performance rules** (indexes, pagination, summary queries, caching).
5. **Channel adapter rules** (idempotency, dedupe, fallbacks, thin handlers).
6. **Testing expectations** and what invariants must be locked by tests.

---

## HOW

## 0) Convex official references (read these first)

These links reflect the official Convex mental model. When this repo’s patterns differ, prefer the repo’s security/zone rules, but do not contradict Convex fundamentals:

- Convex docs (start): https://docs.convex.dev/
- Queries vs mutations vs actions: https://docs.convex.dev/functions
- HTTP actions (webhooks): https://docs.convex.dev/functions/http-actions
- Search indexes + `withSearchIndex`: https://docs.convex.dev/search
- Data modeling + indexes: https://docs.convex.dev/database
- Auth and identity: https://docs.convex.dev/auth

---

### 1) Zone boundaries are strict

Convex code is organized into zones (folders). A zone **owns** its responsibilities and exports a **small public API**.

**Zones (high-level):**

- `convex/_core/` — schema, auth, identity normalization, access policy, foundational primitives.
- `convex/shared_logic/` — shared business capabilities (inbox, offers, properties, market, subscriptions, knowledge, etc.).
- `convex/ai_zone/` — assistant endpoints, multi-agent orchestrator, agent teams/tools, and channel adapters.
- `convex/user_zone/` — user-facing backend features (mobile feed, mobile assistant).
- `convex/broker_zone/` — broker-scoped backend adapters.
- `convex/red_zone/` — developer (RED) scoped backend adapters.
- `convex/admin_zone/` — admin read models and operations.
- `convex/public_zone/` — public endpoints and unauthenticated/entry features.

**Allowed imports (default):**

- Import within your zone.
- Import from `_core` and shared low-level primitives.
- Import from `shared_logic` only when you are consuming a shared capability (not duplicating it).

**Forbidden:**

- Deep-importing internal files across zones (“reach into another zone’s internals”).
- Duplicating a business rule that already exists in `shared_logic`.
- Calling `ctx.db` from random places when a capability already offers a shared accessor/service.

**Practical rule:** if you need a function from another zone, that zone must export it from a clear entry module (or you must move the shared behavior into `shared_logic`).

Reference: each zone has a `ZONE_README.md` describing its intended public API and boundaries.

---

### 2) Queries vs mutations vs actions vs httpAction

Convex has multiple function types. Use the minimal power needed.

#### `query`

- **Use when:** reading data.
- **Rules:**
  - Must be deterministic for the same inputs.
  - No side effects.
  - Must be index-first (see performance rules below).
  - Prefer projections over raw rows (don’t leak schema internals to surfaces).

#### `mutation`

- **Use when:** writing/patching data.
- **Rules:**
  - Validate inputs and enforce ownership.
  - Prefer “one mutation = one business state transition”.
  - Avoid “write many unrelated tables” unless the domain requires it.
  - Always verify the *prior state* before transitioning (prevents repeated acceptance, duplicated deals, etc.).

#### `action`

- **Use when:** you need non-deterministic work or external I/O:
  - calling LLMs,
  - calling WhatsApp / Meta APIs,
  - heavy compute that should not run in a query/mutation.
- **Rules:**
  - Actions still must enforce identity and ownership before doing privileged work.
  - Never let an action become a “god service” that bypasses zone boundaries.
  - Treat actions as “services” and keep the entry controller thin.

#### `httpAction` (Convex HTTP endpoints)

- **Use when:** integrating external ingress (webhooks, OAuth).
- **Rules:**
  - The handler must be **thin**: parse, validate, dedupe/idempotency check, then delegate to a zone service/action/mutation.
  - Never put business logic directly in the HTTP handler.
  - Always have safe fallbacks (200 for “received” when appropriate, and safe user-facing failure messages when replying in channels).
  - Never log raw request bodies (PII risk).

**Concrete example (WhatsApp):**

`convex/http.ts` routes → `convex/ai_zone/channels/whatsapp/webhook.ts` (thin) → preprocess pipeline → `internal` action → transport service sends reply.

---

### 3) Identity + ownership: never guess

Ownership is multi-dimensional in Anan. The same feature might involve:

- an authenticated user (`userProfiles`),
- an organization owner (`brokerId` or `REDId`),
- a channel user (`users` table, e.g., WhatsApp user id),
- or combinations of the above (workspace + assistant threads + inbox).

**Rules:**

1. Always resolve the caller identity using the existing auth/identity helpers for that zone.
2. Enforce ownership in shared services (not in UI, not in route shells).
3. Never “default” to a role or owner type when fields are missing.

#### Naming: `RED` vs `developer`

The codebase currently uses both terms:

- **Storage-level / schema-level** naming often uses `RED` / `REDId`.
- Some surfaces (web contracts) normalize this to `developer` / `redId`.

**Rule:** keep schema naming at storage boundaries and normalize only at explicit contract boundaries. Do not invent a third naming convention.

---

### 3.1) AuthZ checklist (must pass for every protected handler)

Use this checklist for every new **query**, **mutation**, **action**, and **httpAction** that touches protected data:

1. **Authentication**
   - Does this handler require auth? If yes, fail with `UNAUTHORIZED` early.
   - If unauthenticated access is intended, explicitly justify it and keep output non-sensitive.
2. **Role gate**
   - Verify role using central helpers (example: `_core/security/accessPolicy.ts`).
   - Reject-by-default: if role is unknown or missing, return `FORBIDDEN`.
3. **Row-level ownership**
   - For every `Id<"table">` input, verify the row exists and belongs to the caller’s owner context.
   - Never accept a caller-supplied owner id as “truth” without verifying it matches the resolved session.
4. **State prerequisites**
   - Verify status/publication prerequisites before state transitions.
   - Disallow repeated/duplicate transitions (e.g., accepting a public offer twice).
5. **Least privilege outputs**
   - Queries must not return fields that the caller doesn’t need.
   - Avoid returning raw table rows to surfaces.

If any checklist item is unclear, stop and read the owning zone’s `ZONE_README.md` before coding.

---

### 4) Performance rules (non-negotiable)

Convex performance is primarily about:

- using indexes,
- limiting reads,
- not scanning whole tables,
- pushing aggregation into dedicated “summary” queries rather than list-then-reduce patterns.

#### Index-first reads

1. Prefer `withIndex` + `eq` constraints for reads.
2. If you must scan, it must be rare, bounded, and justified in code review.
3. Use pagination for lists; do not `take(200)` as a fake “directory search”.
4. Prefer search indexes for text retrieval (`searchIndex` + `withSearchIndex`) instead of scanning.

#### Avoid unbounded `collect()`

`collect()` is a scan. Treat it as a correctness and performance risk unless the table is strictly bounded.

Allowed uses:

- small configuration tables,
- admin-only diagnostics in small environments (explicitly documented),
- controlled internal migrations with strict limits.

If the table can grow, use:

- an index lookup (`withIndex`), or
- a search index (`withSearchIndex`), or
- pagination, or
- a summary query.

#### Prefer summary queries

Bad pattern:

- query “all conversations” → sum unread counts in JavaScript.

Good pattern:

- create a dedicated query like `getInboxUnreadSummary` that returns the aggregate.

#### Avoid “first N” correctness bugs

Any logic that uses `take(N)` to find “the target” can silently fail once the system has more than `N` rows.

If you need a lookup:

- use an index lookup (preferred), or
- use a deterministic search key (email normalization, directKey, etc.), or
- redesign the data model to make lookup safe.

#### Caching

- Convex queries are already cached per-client by the runtime, but server layers and actions can re-run repeated calls.
- If a web server layer calls Convex repeatedly in the same request, prefer request-scoped caching on the server gateway (example pattern: React `cache()` on the Next side).

---

### 5) Channel adapter rules (WhatsApp, future channels)

Channel adapters are “front doors” to the system. They must be safe under retries and partial failures.

**Rules:**

1. **Idempotency:** treat inbound `messageId` as a dedupe key. Webhook delivery can retry.
2. **Thin handlers:** webhook routes do parsing, validation, and delegation only.
3. **Preprocess pipeline:** normalize text/voice before it hits assistant orchestration.
4. **Fallbacks:** on failure:
   - return 200 “received” to the channel when appropriate,
   - send a safe localized fallback message to the user when replying fails.
5. **No prompt dumps:** never log full user prompts, thread history, or extracted PII to `console` for debugging.
6. **Transport service boundary:** keep vendor API calls (Meta, Twilio, email) isolated in a service module (e.g., `service.ts`).

---

### 5.1) Webhook checklist (idempotency and replay safety)

Every webhook handler must:

1. Parse safely (handle invalid JSON and missing fields).
2. Validate vendor signature/token if supported (or explicitly document why not).
3. Dedupe using a stable message/event id.
4. Be safe under retries and reordering.
5. Return stable “received” responses so vendors don’t retry forever.
6. Avoid leaking internals in error text returned to the vendor.

---

### 5.2) Agent/tool checklist (prevents “god orchestrator” drift)

Rules for `convex/ai_zone/*`:

1. Orchestrator selects teams/agents; **agents call tools**.
2. Tools must enforce access checks the same way normal queries/mutations do.
3. Never put direct data access inside the orchestrator to “save time”.
4. Keep prompt context minimal and structured; never dump whole tables.
5. Do not log raw prompts, thread history, or PII to console.

---

### 6) Testing expectations (what must be locked)

Convex tests live near the capability they protect (examples already exist under `convex/shared_logic/**/*.test.ts` and `convex/ai_zone/channels/**/*.test.ts`).

Use the repo’s Convex test harness (see `convex/test.setup.ts`) and add tests when changing:

- ownership checks (broker/developer/admin/user),
- offer transitions and visibility rules,
- inbox unread counters and dedupe keys,
- assistant thread/message persistence invariants,
- channel rules (webhook parsing, preprocessing, idempotency behavior),
- any bug that can fail only “after scale” (pagination and `take(N)` lookups).

**Minimum bar:** if a bug was possible before your change, the repo should gain a test preventing it from reappearing.

---

## Related handbook chapters

- Deep Convex handbook: `docs/handbook/convex/README.md`
- Security/AuthZ: `docs/handbook/security/README.md`
- LLM rules: `docs/handbook/llm/README.md`

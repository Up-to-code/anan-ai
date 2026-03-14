# Glossary (Platform + Codebase)

---

## WHY

The codebase uses multiple overlapping domain terms (role, owner, workspace, channel user, RED/developer). This glossary makes those terms unambiguous so developers and LLMs don’t invent their own meanings.

---

## WHAT

Definitions used across the handbook, including ownership ids, zones, and “surface vs backend” responsibilities.

---

## HOW (Definitions)

### Surface

A user-facing runtime client:

- `apps/web` — workspace + public web.
- `apps/admin` — operations console.
- `apps/mobile` — buyer app (Expo).
- Channels — WhatsApp today, more later (ingress into Convex HTTP routes).

### Convex

The backend runtime (database + serverless functions). It owns:

- schema,
- auth + identity normalization,
- access policy,
- shared business logic,
- AI orchestration,
- channel ingress.

### Zone

A folder under `convex/` that owns a bounded responsibility. Zones are architectural boundaries, not just organization.

### `_core`

The foundation zone under `convex/_core/`. It defines:

- tables (schema fragments),
- access policy and identity normalization,
- auth configuration.

### `shared_logic`

The shared business-capability zone under `convex/shared_logic/`. It owns rules reused across multiple audiences (inbox, offers, market, properties, knowledge, subscriptions).

### Owner / Ownership

The entity allowed to read/write a resource. In Anan, ownership may be:

- an authenticated user (`userProfiles`),
- an organization owner (`brokerId` or `REDId`),
- a channel-scoped user (`users` table; e.g., WhatsApp `wa_id`).

### `RED` / developer

Two names for the developer organization concept:

- Schema/storage commonly uses `RED` and `REDId`.
- Some surfaces normalize to `developer` and `redId`.

Rule: keep schema naming at storage boundaries; normalize only at explicit contract boundaries.

### Workspace

The signed-in product surface for brokers and developers (and some admin-like views), primarily under `apps/web/app/(ws)`.

### Public site

The public marketing/legal pages under `apps/web/app/(public)`. These should avoid unnecessary client JS and should be statically optimizable when possible.

### Thread (Assistant)

An assistant conversation container (typically `assistantThreads` table) that owns:

- thread identity,
- mode (e.g., `qa` vs `action`),
- assistant kind,
- orchestration metadata,
- message history (`assistantMessages`).

### Conversation (Inbox)

Inbox DM thread (e.g., `inboxConversations`), typically with participants (`inboxConversationParticipants`) and messages (`inboxMessages`) plus unread counters.

### Capability

A backend-owned business feature area that must be implemented once and reused:

- Inbox, offers, properties search, market analytics, subscriptions, knowledge retrieval.

### Contract

A stable shape at a boundary, typically:

- `apps/web/server/contracts/**` (web gateway DTOs),
- admin loader shapes (admin ↔ Convex admin read models),
- mobile DTO mapping (mobile ↔ Convex user_zone endpoints).


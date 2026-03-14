# Convex Zones (What belongs where)

---

## WHY

Zones are the backend’s “walls”. They prevent:

- cross-feature tangles,
- duplicated business logic,
- security shortcuts,
- and accidental coupling between unrelated surfaces.

---

## WHAT

This chapter defines what each zone owns and how to decide where new code should go.

---

## HOW (Decision rules)

### `_core/`

- Owns: schema + security + identity normalization + auth/OAuth internals.
- Must not contain: business-facing queries/mutations/actions.

### `shared_logic/`

- Owns: shared, reusable business capabilities.
- Use when: the capability must behave consistently for multiple audiences (broker, developer, admin, mobile, channels).
- Typical structure: access → queries → mutations → side effects → tests.

### `ai_zone/`

- Owns: assistant endpoints, orchestration runtime, agent teams/tools, and channel adapters.
- Use when: behavior is assistant-driven or channel-driven (WhatsApp ingestion, multi-agent orchestration).

### `user_zone/`

- Owns: user/buyer flows (mobile feed endpoints, mobile assistant endpoints).
- Use when: the primary surface is buyer-facing and the API shape is mobile-specific.

### `broker_zone/` and `red_zone/`

- Own: owner-scoped adapter endpoints.
- Use when: you need a broker/developer constrained view or “repository-style” access to data owned by an org.

### `admin_zone/`

- Owns: admin projections and operations (verification, diagnostics, internal joined views).
- Use when: output is admin-optimized and operational.

### `public_zone/`

- Owns: public/entry features that are not workspace-authenticated.
- Use when: the call is intentionally unauthenticated or public entrypoint behavior.

---

## Allowed / forbidden examples

### Good: shared capability used by multiple surfaces

- Mobile and workspace both need “inbox unread summary” → build it once in `shared_logic/inbox` and consume it.

### Bad: copy/paste capability into each zone

- Adding a second “offer apply” flow in `broker_zone` that duplicates `shared_logic/offers` business rules.

### Good: channel-specific preprocessing delegates to shared AI runtime

- `ai_zone/channels/whatsapp/preprocess/*` normalizes inbound text/voice then calls an internal action.

### Bad: webhook handler contains business logic

- `httpAction` parses webhook and directly does DB writes + AI calls without delegating to zone services.

---

## Where to change code

- Use the zone’s `ZONE_README.md` first:
  - `convex/_core/ZONE_README.md`
  - `convex/shared_logic/ZONE_README.md`
  - `convex/ai_zone/ZONE_README.md`
  - (and others)

---

## Common pitfalls

- Putting “quick fixes” into the wrong zone and leaving them forever.
- Deep-importing into another zone’s internal files.
- Creating a new folder name that semantically overlaps an existing capability (duplicate ownership).


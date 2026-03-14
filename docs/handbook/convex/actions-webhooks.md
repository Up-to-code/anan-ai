# Actions + Webhooks (httpAction) Hardening

---

## WHY

Webhooks retry and external APIs fail. If your handler is not idempotent and thin, it will:

- duplicate writes,
- send duplicate replies,
- or leak internal errors to vendors.

Actions exist to isolate non-deterministic I/O and keep queries/mutations clean.

---

## WHAT

Rules for:

- `action` usage,
- `httpAction` usage,
- webhook idempotency,
- delegation and fallback patterns.

---

## HOW

### Actions

Use actions for:

- LLM calls,
- vendor APIs,
- heavy compute.

Rules:

- enforce identity and access before privileged work,
- do not bypass zone boundaries,
- keep action entrypoints thin (delegate to services).

Official reference:

- https://docs.convex.dev/functions/actions

### HTTP actions (webhooks)

Rules:

1. Parse safely.
2. Validate (verify token/signature when applicable).
3. Dedupe with stable ids.
4. Delegate business logic.
5. Reply with safe fallbacks.

Official reference:

- https://docs.convex.dev/functions/http-actions

### WhatsApp reference implementation

Use as blueprint:

- `convex/http.ts`
- `convex/ai_zone/channels/whatsapp/webhook.ts`
- `convex/ai_zone/channels/whatsapp/preprocess/*`
- `convex/ai_zone/channels/whatsapp/service.ts`


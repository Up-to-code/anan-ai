# Convex HTTP Router + OAuth

---

## WHY

Convex HTTP routes are the backend’s public ingress for:

- health checks,
- channel webhooks (WhatsApp),
- OAuth endpoints.

These endpoints are security-sensitive and must remain thin and auditable.

---

## WHAT

The repo’s HTTP router lives in `convex/http.ts` and wires:

- auth HTTP routes (via Convex auth runtime),
- `GET /health`,
- WhatsApp webhook routes,
- OAuth routes (`/authorize`, `/token`, `/userinfo`, metadata, JWKS),
- delegated OAuth resources endpoints.

---

## HOW (Rules)

### HTTP router rules

1. `convex/http.ts` only wires routes; it should not contain business logic.
2. Each route handler must be:
   - thin,
   - validated,
   - delegated to an owning zone/module.

### OAuth rules

OAuth endpoints are routed to `_core/oauth/http` handlers. Keep them:

- isolated from business capabilities,
- strict about validation,
- consistent across GET/POST where supported.

### Channel webhook rules

Webhooks must be idempotent and safe under retries. Follow the channel blueprint in `docs/handbook/convex/channels.md`.

---

## Where to change code

- Router wiring: `convex/http.ts`
- OAuth handlers: `convex/_core/oauth/http`
- WhatsApp webhook: `convex/ai_zone/channels/whatsapp/webhook.ts`

---

## Common pitfalls

- Putting business logic directly into `convex/http.ts`.
- Adding a new HTTP endpoint without deciding which zone owns its behavior.
- Returning verbose internal error information to external callers.


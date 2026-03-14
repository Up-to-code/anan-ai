# System Map (Surfaces → Gateways → Convex)

---

## Surfaces

- `apps/web` — public + workspace
- `apps/admin` — operations console
- `apps/mobile` — buyer app
- Channels — WhatsApp today (Convex HTTP ingress)

---

## Backend (Convex zones)

- `_core` — schema + security + auth/OAuth internals
- `shared_logic` — shared business capabilities
- `ai_zone` — assistant runtime + channel adapters
- `user_zone` — buyer/mobile endpoints
- `broker_zone` / `red_zone` — owner-scoped endpoints
- `admin_zone` — admin projections and operations
- `public_zone` — public endpoints

---

## Typical request “circle”

1. Surface input
2. Web gateway (optional): `apps/web/server/**`
3. Convex identity + access policy
4. Capability execution (zone/shared logic)
5. Persistence + projections
6. Surface renders + real-time updates

Deep reference: `docs/handbook/README.md`


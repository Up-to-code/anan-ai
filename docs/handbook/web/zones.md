# Web Zones (Server + Workspace)

---

## WHY

The web app has two zone layers with different jobs:

- `apps/web/server/**` owns web-only orchestration and contracts
- `apps/web/app/(ws)/ws/(zones)/**` owns workspace route composition and page UI

Without an explicit map, engineers end up editing random pages or helpers without understanding the actual public boundary.

---

## WHAT

This page is the handbook-level map of the web zones. The detailed source of truth lives in the local docs beside each zone.

---

## HOW (Zone map)

### Server zones

- `apps/web/server/ws`
  - purpose: audience-aware workspace composition
  - read first: `apps/web/server/ws/README.md`
  - shape: `zones.ts` public gateway plus internal `capabilities/`, `session/`, and `shared/` buckets
- `apps/web/server/broker_zone`
  - purpose: broker-facing server orchestration
  - read first: `apps/web/server/broker_zone/README.md`
- `apps/web/server/red_zone`
  - purpose: developer-facing server orchestration
  - read first: `apps/web/server/red_zone/README.md`

### Workspace UI zones

- `crm`
  - purpose: CRM route composition and page UI
  - read first: `apps/web/app/(ws)/ws/(zones)/crm/README.md`
- `projects`
  - purpose: project list/detail/create/edit UI
  - read first: `apps/web/app/(ws)/ws/(zones)/projects/README.md`
- `offers`
  - purpose: offer overview/detail/profile/search/create UI
  - read first: `apps/web/app/(ws)/ws/(zones)/offers/README.md`
- `market`
  - purpose: market dashboards, tabs, and market-specific view shaping
  - read first: `apps/web/app/(ws)/ws/(zones)/market/README.md`
- `inbox`
  - purpose: inbox client, realtime state, and thread UI
  - read first: `apps/web/app/(ws)/ws/(zones)/inbox/README.md`

---

## Usage Rules

- Route files stay thin and delegate to page folders or the server layer.
- Workspace UI zones use the same local structure: `pages/` for page ownership, `shared/` for same-zone reuse, `types/` for route-facing types, and optional `fixtures/` for test/mock data.
- Workspace routes should prefer `apps/web/server/ws` for audience-aware backend behavior.
- `broker_zone` and `red_zone` server folders are public server contracts; prefer their root gateways.
- Supporting folders such as `apps/web/server/domains/*` and `apps/web/server/infrastructure/*` are dependencies, not standalone zones in this documentation system.

---

## Local Doc Set

Every web zone in this system now has:

- a canonical local `README.md`
- `ZONE_REGISTER.md`
- `ZONE_AUDIT.md`

If the handbook and the local zone docs disagree, trust the local zone docs and then update the handbook summary.

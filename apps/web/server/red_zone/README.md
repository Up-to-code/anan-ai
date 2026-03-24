# Web Server `red_zone`

## Ownership And Purpose
`apps/web/server/red_zone` owns developer-facing Next.js server orchestration. It validates developer payloads, restores developer session context, composes Convex repositories, and exposes a developer-safe contract to workspace routes and server actions.

## Why This Zone Exists
The web app needs a server-owned layer between developer routes and Convex. This zone keeps RED validation, DTO shaping, and repository wiring out of JSX while preserving clean ownership boundaries.

## Architecture Overview
- `index.ts`: root gateway for developer server capabilities
- `overview/`: developer overview loader
- `properties/`: developer property CRUD/publish orchestration
- `offers/`: developer offer snapshot and lifecycle orchestration
- `crm/`: developer CRM orchestration
- `organizations/`: developer organization/team orchestration

## Flowchart
```mermaid
flowchart LR
  A["Workspace route / server action"] --> B["web/server/red_zone"]
  B --> C["validation + session + repository wiring"]
  C --> D["Convex red_zone or shared_logic"]
  D --> E["Developer-safe DTO for the route"]
```

## Stable Entrypoints
- `index.ts`
- `overview/index.ts`
- `properties/index.ts`
- `offers/index.ts`
- `crm/index.ts`
- `organizations/index.ts`

## Outside-In Usage
Use this zone when the caller is a developer-facing web route or action. Import from `@/server/red_zone` when you need the developer surface as a whole; keep subfolder imports for work happening inside the zone itself. If behavior is audience-agnostic across broker and developer, prefer `ws` or `shared_logic`.

## Allowed And Forbidden Imports
- Allowed: contracts, auth/session helpers, repository adapters, `convex` backend contracts through infrastructure adapters
- Allowed: `ws` composition layer as an upstream caller
- Forbidden: direct route-level Convex orchestration that skips this server layer
- Forbidden: importing `broker_zone` internals for shared business rules

## Dependency Map
- Upstream consumers: `apps/web/server/ws`, developer-facing routes and actions
- Downstream dependencies: infrastructure repositories, RED Convex backend handlers, shared contracts

## Common Extension Tasks
- Add a developer server mutation: start in the relevant feature folder and keep the route file thin
- Add a reusable developer capability: expose it from `index.ts` once the feature folder contract is stable

## Related Docs
- `apps/web/server/red_zone/ZONE_REGISTER.md`
- `apps/web/server/red_zone/ZONE_AUDIT.md`

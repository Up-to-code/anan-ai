# Web Server Gateway (`apps/web/server/**`)

---

## WHY

The web app needs a stable backend layer that:

- resolves sessions and roles consistently,
- owns web-only orchestration,
- exposes stable DTO contracts to the UI,
- isolates Convex calls behind repository adapters,
- enables request-scoped caching and summary reads.

This avoids “Convex calls scattered everywhere” and keeps UI code simpler.

---

## WHAT

`apps/web/server/**` is the web backend gateway layer. It is not a second backend; it is a web-specific service boundary.

Core subfolders:

- `auth/` — session resolution, role context.
- `contracts/` — DTOs, zod validation, stable shapes/errors.
- `domains/` — business orchestration per domain (inbox, workspaces, contact, etc.).
- `infrastructure/convex/` — repository adapters calling Convex functions.

Rule: `apps/web/app/api/**` route handlers must stay thin and delegate here.

---

## HOW (Layering rules)

### Contracts

Contracts define what the UI/server layer considers “stable”. They should:

- validate external inputs (zod),
- normalize naming (e.g., `REDId` → `redId`) at the boundary,
- hide Convex storage details from UI components.

### Domains

Domains orchestrate:

- auth/role branching,
- calling repository adapters,
- composing multiple Convex reads into one “web view model”,
- returning stable DTOs.

Domain services must not:

- render UI,
- implement Convex DB logic directly.

### Convex repositories (infrastructure)

Repository adapters are the only layer that directly calls Convex APIs from the web server gateway.

Rules:

- one adapter per backend capability cluster (inbox, workspaces, contact),
- no “random” Convex calls from UI code when a domain already exists.

---

## Where to change code

- Gateway root: `apps/web/server/README.md`
- Contracts: `apps/web/server/contracts/**`
- Domain services: `apps/web/server/domains/**`
- Convex adapters: `apps/web/server/infrastructure/convex/**`

---

## Common pitfalls

- Returning raw Convex table rows directly to React components.
- Adding new zod schemas inside random route handlers instead of in contracts.
- Creating “mega services” that mix many unrelated domains.


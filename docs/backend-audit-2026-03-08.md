# Backend Audit - March 8, 2026

## Scope

This audit focused on the highest-risk authorization and architecture boundaries in the current Next.js + Convex split:

- `web/server/auth/*`
- `web/server/broker_zone/*`
- `web/server/red_zone/*`
- `convex/_core/security/*`
- `convex/shared_logic/agencies/*`
- `convex/shared_logic/crm/services/dealsService.ts`
- `convex/shared_logic/oauth/internal.ts`
- `convex/shared_logic/services/properties.ts`
- `convex/shared_logic/services/offersService.ts` before refactor

## Prioritized Findings

### P1

- `web/server/contracts/errors.ts`
  The domain error catalog was incomplete for active authz flows such as `ROLE_PENDING`, `ROLE_REJECTED`, `VERIFICATION_REQUIRED`, and `INVITE_EXPIRED`. This could leak raw 500 responses from otherwise expected business failures.
- `web/server/broker_zone/*` and `web/server/red_zone/*`
  Role and owner-link checks were duplicated inline across multiple server-function files. Duplication increases drift risk, especially while `RED` and `developer` both exist during migration.
- `convex/shared_logic/services/offersService.ts`
  Authentication, verification, recipient lookup, writes, and listing projections were coupled in one file. This increased the chance of ownership and visibility rules drifting across mutations and queries.

### P2

- `convex/shared_logic/crm/services/dealsService.ts`
  The file still performs its own identity/profile resolution instead of consuming a shared owner-access helper. It is functional, but it duplicates security logic and should move behind server-owned orchestration for web flows.
- `convex/shared_logic/agencies/services/agenciesService.ts`
  Organization onboarding, membership, invite, and owner/team logic remain in one service file. The stale-link reconciliation fix is in place, but the file is still oversized and mixes concerns.
- `convex/shared_logic/oauth/internal.ts`
  The file is too large and still uses broad `any`-typed helpers for several DB queries. This raises review cost and makes security-sensitive grant logic harder to verify.

### P3

- `convex/shared_logic/services/properties.ts`
  Search/cache logic, analytics logging, and public property search live together. The file is not showing an immediate authz bug, but it is a strong candidate for capability splitting.
- `web/server/auth/session.ts` and `web/server/contracts/profiles.ts`
  The gateway still carries mixed `redId` and `REDId` naming because Convex documents use `REDId`. The mapping works, but it remains a readability hazard.

## Authorization Boundary Map

### Stronger After This Pass

- Next.js role guards are now centralized in `web/server/auth/guards.ts`.
- Broker/Developer server functions now depend on shared guards instead of duplicating role checks.
- Domain errors now normalize the current role/verification/invite failure set before they reach routes or UI.

### Still Weak or Duplicated

- `convex/shared_logic/crm/services/dealsService.ts`
  Still resolves auth/profile directly inside Convex.
- `convex/shared_logic/agencies/services/agenciesService.ts`
  Still owns user-facing orchestration that should continue moving into `web/server/domains/organizations`.
- `convex/shared_logic/oauth/internal.ts`
  Remains internal-only, but is still too broad and too loosely typed.

## Delete / Deprecate List

- Deleted: `convex/shared_logic/services/offersService.ts`
- Keep deprecating direct `web` dependencies on public `shared_logic/*` endpoints in favor of server-owned services plus internal/repository Convex adapters.
- Continue reducing public app-facing exports from:
  - `convex/shared_logic/agencies/index.ts`
  - `convex/shared_logic/crm/index.ts`
  - `convex/shared_logic/users/index.ts`

## Target Folder Map

### Convex

Keep top-level zones:

- `convex/_core`
- `convex/admin_zone`
- `convex/broker_zone`
- `convex/red_zone`
- `convex/ai_zone`
- `convex/shared_logic`

Target internals:

- `convex/shared_logic/agencies/`
  - `index.ts`
  - `organization/`
  - `invites/`
  - `team/`
- `convex/shared_logic/offers/`
  - `index.ts`
  - `access.ts`
  - `mutations.ts`
  - `queries.ts`
  - `recipients.ts`
- `convex/shared_logic/properties/`
  - `searchText.ts`
  - future: `search/`, `cache/`, `analytics/`
- `convex/shared_logic/oauth/`
  - future: `authorize.ts`, `consent.ts`, `tokens.ts`, `revocation.ts`, `subjectMappings.ts`

### Web Server

- `web/server/auth/`
  - `session.ts`
  - `guards.ts`
- `web/server/contracts/`
  - shared DTOs and normalized domain errors
- `web/server/domains/`
  - `organizations/`
  - `profiles/`
  - `workspaces/`
- `web/server/broker_zone/`
  - server functions only
- `web/server/red_zone/`
  - server functions only
- `web/server/infrastructure/convex/`
  - repository adapters only

## Immediate Next Cleanup Targets

1. Split `convex/shared_logic/agencies/services/agenciesService.ts` into organization, invite, and team modules.
2. Move web-owned CRM orchestration out of `convex/shared_logic/crm/services/dealsService.ts` and behind Next.js server functions.
3. Break `convex/shared_logic/oauth/internal.ts` into smaller internal files and remove broad `any` query helpers.
4. Continue normalizing `REDId` document fields into `redId` at the web contract boundary only.

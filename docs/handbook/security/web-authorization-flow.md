# Web Authorization Flow (Frontend -> Gateway -> Convex)

---

## WHY

The web authorization surface spans three runtime boundaries:

1. Next.js client interactions (`apps/web/components/**`),
2. Next.js server gateway (`apps/web/server/**` + `apps/web/app/**` routes),
3. Convex auth + authorization backend (`convex/**`).

Without a strict map, we risk:

- duplicate checks that drift,
- hidden-field trust issues in OAuth consent actions,
- table scans inside hot auth paths,
- inconsistent redirects and weak session-failure handling.

This document defines the exact current flow and the enforced guard points.

---

## WHAT

This is the authoritative path for authentication + authorization in web:

- Google sign-in entry at `/signin`
- Convex-auth session issuance
- server-side session hydration in `apps/web/server/auth/session.ts`
- role/owner gates via `apps/web/server/auth/guards.ts`
- domain-level protected operations in `apps/web/server/domains/**`
- OAuth consent and connected-app lifecycle in `/oauth/authorize` + security apps pages

---

## HOW

### 1. Client sign-in initiation

- File: `apps/web/app/(public)/signin/page.tsx`
- Trigger: user clicks `GoogleSignInButton`.
- Control:
  - `returnTo` is sanitized through `sanitizeInternalReturnTo`.
  - only internal paths are accepted (`/`, not `//`, not `/signin`).

### 2. OAuth provider redirect safety

- File: `convex/auth.ts` (Convex Auth callback `redirect`).
- Control:
  - destination must match resolved allowed origins,
  - relative paths are anchored to the configured web base URL,
  - unknown origins are rejected by falling back to the web base.

### 3. Profile synchronization and active-account gate

- File: `convex/auth.ts` (`afterUserCreatedOrUpdated`, `beforeSessionCreation`).
- Controls:
  - user profile synced to `userProfiles` on auth user create/update,
  - session creation blocked when `userProfiles.isActive === false`.

Implementation note (2026-03-17 hardening):

- replaced `query("userProfiles").collect().find(...)` with indexed lookup by `authUserId`.
- this removes full-table scans from the session-creation hot path.

### 4. Gateway session resolution

- File: `apps/web/server/auth/session.ts`.
- Flow:
  1. get Convex token (`convexAuthNextjsToken`),
  2. fetch current session user projection,
  3. fetch current profile projection,
  4. build normalized `SessionContext`.
- Controls:
  - returns `null` when token missing/stale, user missing, or inactive,
  - `requireSessionContext` throws normalized `UNAUTHORIZED` (401).

### 5. Role + owner enforcement

- File: `apps/web/server/auth/guards.ts`.
- Enforced role guards:
  - `requireBrokerSession`: role must be `broker` + `brokerId` present,
  - `requireDeveloperSession`: role `developer` or `RED` + `redId` present,
  - `requireAdminSession`: role must be `admin`.

### 6. OAuth consent page safety

- File: `apps/web/app/oauth/authorize/page.tsx`.
- Flow:
  1. read `flow` query id,
  2. require session,
  3. load server-validated prompt via domain service,
  4. approve or deny.

Security hardening (2026-03-17):

- deny action now uses `flowId` only,
- redirect URI and state are reloaded server-side from authorized flow metadata,
- hidden `redirectUri/state` trust was removed.

### 7. Connected apps management

- Files:
  - `apps/web/app/(ws)/ws/(overview)/me/security/apps/page.tsx`
  - `apps/web/app/(ws)/ws/(overview)/me/security/apps/[clientId]/page.tsx`
- Guard:
  - redirect to `/signin` when no auth token.
- Cleanup (2026-03-17):
  - removed redundant `user` checks after session projection (token gate is sufficient).

---

## Enforced Guard Stack Summary

Every protected web operation should follow:

1. `requireSessionContext` (authentication),
2. role/owner guard where required (`requireBrokerSession` / `requireDeveloperSession` / `requireAdminSession`),
3. domain validation and ownership checks in service/repository layer,
4. normalized error responses through `toErrorResponse`.

---

## Anti-Patterns To Block In Review

Block PRs that introduce any of the following:

- `collect()` scans in auth/session hot paths where indexed lookup exists,
- trusting hidden form fields for OAuth redirect/state decisions,
- role checks without owner-link checks (`brokerId`, `redId`) where required,
- ad-hoc redirects that bypass `returnTo` sanitization.

---

## Regression Locks

Coverage that should remain green:

- `apps/web/app/oauth/authorize/page.test.tsx`
- `apps/web/server/auth/guards.test.ts`
- `apps/web/app/api/session/route.test.ts`
- `apps/web/app/(public)/signin/page.test.tsx`
- `convex/_core/security/authRedirects.test.ts`


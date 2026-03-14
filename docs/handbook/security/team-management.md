# Team Management (Developers/Brokers) + Authorization Rules

---

## WHY

Anan is organization-owned. Most sensitive actions should be allowed because:

- the caller belongs to an organization (broker or RED),
- the organization is verified (for certain operations),
- and the caller’s role inside that org is allowed.

If team membership rules are unclear, code drifts into “role guessing” and permission bugs.

---

## WHAT

This chapter documents how team membership is represented and how to enforce it:

- `teamInvites` — invite lifecycle (pending/accepted/expired)
- `organizationMemberships` — active membership linking auth users to org owners
- `userProfiles` — user role identity and links to `brokerId` / `REDId`

---

## HOW (Rules)

### 1) Org membership is not just a UI concept

If a feature is organization-owned, enforce org membership server-side.

Do not rely on UI hiding buttons.

### 2) Verified operations must be explicit

Some operations require verified orgs (publishing offers, etc.).

Use existing verification helpers (example: `_core/security/accessPolicy.ts` `requireVerifiedRole`) where applicable.

### 3) Avoid “first N” membership lookups

Never resolve membership or targets by:

- scanning profiles and `take(N)`.

Use indexes and deterministic keys.

---

## Where to change code

- Membership schema: `convex/_core/schema/agencies.ts`
- Access policy: `convex/_core/security/accessPolicy.ts`
- Shared org logic: `convex/shared_logic/agencies/*`


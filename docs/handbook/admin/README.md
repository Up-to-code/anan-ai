# Admin Handbook (Operations Console)

---

## WHY

The admin app is the operational control surface for Anan. It should:

- observe the platform,
- manage platform knowledge and verifications,
- run operational mutations safely,
- avoid duplicating backend logic.

---

## WHAT

The admin surface lives in `apps/admin` and is backed by:

- Convex admin read models (`convex/admin_zone/**`),
- admin loaders and orchestrators (`apps/admin/admin_zone/**`).

Admin is not a separate backend. It is a client of Convex with admin-specific projections.

---

## HOW (Rules)

1. Keep App Router routes thin.
2. Use `admin_zone/api/*` for admin data loaders and actions.
3. Use `convex/admin_zone/*` for admin projections/mutations.
4. Prefer joined/admin-optimized projections in Convex over doing N+1 joining in the admin UI.

---

## Where to change code

- App Router: `apps/admin/app/**`
- Admin orchestration: `apps/admin/admin_zone/**`
- Convex admin backend: `convex/admin_zone/**`


# Recipe: Add a new Convex table (end-to-end)

---

## WHY

Tables are permanent commitments. This recipe ensures new tables:

- have the correct ownership model,
- are queryable efficiently (indexes),
- have safe read/write entrypoints,
- and are consumable by surfaces through stable contracts.

---

## WHAT

Step-by-step checklist for:

- schema definition,
- wiring into `convex/schema.ts`,
- access policy assumptions,
- adding queries/mutations,
- adding tests,
- exposing the capability to web/admin/mobile safely.

---

## HOW (Steps)

1. **Decide ownership**
   - Is the table owned by an auth user, a broker org, a developer/RED org, or a channel user?
   - Write this down before writing code.

2. **Add the schema fragment**
   - Create/extend a file under `convex/_core/schema/<domain>.ts`.
   - Define:
     - the table,
     - required fields (including ownership),
     - state fields (`status`, `publicationState`) if applicable,
     - indexes for primary lookups.

3. **Wire into the final schema**
   - Export the fragment and spread it into `convex/schema.ts`.

4. **Add backend entrypoints**
   - If shared: add queries/mutations under `convex/shared_logic/<capability>/*`.
   - If owner-scoped: add under `convex/broker_zone/*` or `convex/red_zone/*`.
   - If admin: add under `convex/admin_zone/*`.

5. **Enforce access**
   - Use existing identity + access helpers from `_core/security/*`.
   - Never “guess” owner type.

6. **Add tests**
   - Add a focused `*.test.ts` near the capability that locks:
     - ownership restrictions,
     - state transitions,
     - index lookup correctness,
     - aggregation correctness (if any).

7. **Expose to surfaces**
   - Web: add repo adapter in `apps/web/server/infrastructure/convex/*`, DTOs in `apps/web/server/contracts/*`, and orchestration in `apps/web/server/domains/*`.
   - Admin: add admin loaders under `apps/admin/admin_zone/api/*` and use `convex/admin_zone/*` projections.
   - Mobile: expose under `convex/user_zone/mobile/*` and map results into mobile DTOs in hooks.

---

## Common pitfalls

- No indexes for primary lookup paths.
- Mixing contract naming into schema storage fields.
- Letting multiple zones “own” writes to the same table without a single capability boundary.


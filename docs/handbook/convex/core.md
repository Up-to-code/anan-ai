# Convex `_core` (Schema + Security)

---

## WHY

`convex/_core` is the foundation. It exists to keep the system safe and consistent:

- one schema source of truth,
- one access policy model,
- one identity normalization story (roles, owners, channel identities).

When `_core` is messy, every zone becomes inconsistent.

---

## WHAT

`convex/_core` owns:

- **Schema:** domain table definitions under `convex/_core/schema/*`.
- **Security:** auth/identity helpers and access policy under `convex/_core/security/*`.
- **OAuth internals:** under `convex/_core/oauth/*` and route handlers used from `convex/http.ts`.

`convex/_core` must not contain business-facing queries/mutations.

---

## HOW (Rules of engagement)

### Schema rules

- Every table is defined in `convex/_core/schema/*`.
- `convex/schema.ts` composes the final schema by spreading sub-schemas.
- New tables must come with:
  - ownership fields (who owns the row),
  - indexes that match read patterns,
  - state fields separated correctly (`status` vs `publicationState` when applicable).

### Security rules

- Identity normalization and access checks live in `_core/security/*`.
- Zones and shared logic must rely on these helpers rather than re-implementing “role guessing”.
- Auth configuration lives in `convex/auth.config.ts` and `convex/auth.ts`.

### OAuth rules

OAuth endpoints are routed in `convex/http.ts` and handled by `_core/oauth/http`.

Rule: OAuth endpoints must be thin HTTP handlers that delegate to `_core` internals; do not blend OAuth with business logic.

---

## Where to change code

- Add/modify tables: `convex/_core/schema/*` + `convex/schema.ts`.
- Modify access policy or identity normalization: `convex/_core/security/*`.
- Add OAuth behavior: `convex/_core/oauth/*` + `convex/http.ts`.

---

## Common pitfalls

- Adding a table “temporarily” outside `_core/schema/` (do not).
- Adding “one-off” access checks inside a mutation without using central policy helpers.
- Mutating schema naming inconsistently (e.g., mixing `REDId` vs `redId` at storage level).


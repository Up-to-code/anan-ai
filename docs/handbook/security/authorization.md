# Authorization Patterns (AuthN, Role, Ownership)

---

## WHY

Anan has multiple ownership layers (auth user, org owner, channel user). Without a strict pattern, it’s easy to accidentally let:

- one broker read another broker’s data,
- one developer mutate a public offer after acceptance,
- a channel user trigger privileged flows,
- an unauthenticated caller access sensitive projections.

---

## WHAT

This is the required authorization pattern for every protected handler:

1. Authentication check.
2. Role gate (allowed roles).
3. Row-level ownership checks.
4. State prerequisites checks.
5. Least-privilege output projection.

---

## HOW (Convex pattern)

### The required “guard stack”

In Convex, the default guard stack is:

- `convex/_core/security/identity.ts`
- `convex/_core/security/accessPolicy.ts`

Preferred usage:

- `requireRole(ctx, ["broker", "developer", "admin"])`
- `requireVerifiedRole(ctx, "broker" | "developer")` when operations require verification

### Row-level ownership rules

For every input id:

1. `const row = await ctx.db.get(id)`
2. `if (!row) throw NOT_FOUND`
3. `if (row.ownerId !== access.ownerId) throw FORBIDDEN`

Do not:

- accept `brokerId`, `REDId`, or `userId` from the caller as proof of ownership,
- use `take(N)` to find the “target recipient”.

### State prerequisites rules

Every state mutation must:

- check the prior state,
- reject invalid transitions,
- reject repeated transitions.

Example failure modes:

- accepting a public offer multiple times,
- writing multiple deals for the same offer because status wasn’t checked.

### Least-privilege outputs

Never return:

- raw table rows,
- PII fields unless necessary,
- internal security metadata.

Prefer returning:

- stable DTO projections,
- only the fields needed by the caller.

---

## “Stop the merge” checklist

If any of these are true, block the PR until fixed:

- handler uses `ctx.db.query(...).collect()` on a table that can grow,
- handler resolves a recipient via `take(N)` or by scanning without an index,
- handler trusts a caller-supplied owner id,
- handler returns raw rows to the UI,
- handler does not have tests locking the invariant.


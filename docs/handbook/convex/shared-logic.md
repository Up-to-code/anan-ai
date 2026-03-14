# Shared Logic Capabilities (Pattern + Rules)

---

## WHY

`convex/shared_logic` exists to ensure the platform’s core business capabilities are implemented **once** and reused by:

- web workspace,
- admin projections,
- mobile endpoints,
- AI tools,
- channel adapters.

If shared capabilities drift, the platform stops being coherent.

---

## WHAT

A “capability” in `shared_logic` is the backend-owned implementation of a business feature, typically split into:

- **access** checks,
- **queries** (read models / projections),
- **mutations** (state transitions),
- **side effects** (notifications, message bootstrap),
- **tests** locking invariants.

---

## HOW (Capability structure)

### Recommended folder layout

```text
convex/shared_logic/<capability>/
  access.ts
  queries.ts
  mutations/
    create.ts
    update.ts
    respond.ts
  sideEffects.ts
  index.ts
  *.test.ts
```

If the capability is small, it may live in a single module, but the same separation rules apply.

### Capability rules

1. **Access checks are explicit:** do not “assume the caller is allowed”.
2. **Projections are intentional:** queries should return stable shapes, not raw table rows.
3. **State transitions are guarded:** mutations must enforce:
   - ownership,
   - state prerequisites (e.g., pending → accepted is allowed; accepted → accepted again is not),
   - visibility rules (public vs private).
4. **Side effects are isolated:** notification fanout and inbox bootstrap belong in dedicated functions.
5. **Tests are required** when changing invariants:
   - unread counts,
   - offer transitions,
   - dedupe keys,
   - policy boundaries.

---

## Where to change code

Examples of existing shared capabilities:

- Inbox: `convex/shared_logic/inbox.ts` (plus tests).
- Offers: `convex/shared_logic/offers/*`.
- Market: `convex/shared_logic/market/*`.
- Properties/search: `convex/shared_logic/properties/*`.
- Knowledge: `convex/shared_logic/knowledge/*`.

---

## Common pitfalls

- Adding “just one more rule” inside a route/controller instead of inside the capability.
- Returning raw table rows to surfaces (locks in schema internals and makes refactors painful).
- Allowing state transitions without verifying the prior state (causes repeated acceptance/duplicate deals).


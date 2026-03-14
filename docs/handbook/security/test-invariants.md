# Test Invariants (What must be locked)

---

## WHY

If a logical bug was possible once, it will reappear unless a test prevents it.

This repo already has strong tests around:

- inbox behavior,
- market aggregation,
- property search normalization,
- WhatsApp parsing pipelines,
- access policy helpers.

We extend that philosophy: every important authorization and state-transition rule needs a test.

---

## WHAT

Minimum invariants to test when changing code:

### Authorization invariants

- Unauthenticated callers cannot read protected data.
- Role gating works for each allowed role and blocks disallowed roles.
- Row ownership is enforced (caller can’t read/write another owner’s records).
- Verification requirements are enforced when required.

### “Scale correctness” invariants

- No behavior relies on `take(N)` to find a target.
- Pagination is stable and deterministic.
- Summary queries return correct results without list-then-reduce.

### State machine invariants

- Mutations verify prior state.
- Invalid transitions are rejected.
- Repeated transitions don’t create duplicates (offers → deals, inbox bootstrap, etc.).

### Webhook/channel invariants

- Webhook parsing handles optional/missing fields.
- Idempotency works (duplicate message id does not cause duplicate reply or writes).

---

## HOW (Where to put tests)

- Convex capability tests live near the capability:
  - `convex/shared_logic/**/*.test.ts`
  - `convex/ai_zone/channels/**/*.test.ts`
- Use `convex-test` and `t.withIdentity(...)` to simulate authenticated callers.

Reference:

- `convex/test.setup.ts`


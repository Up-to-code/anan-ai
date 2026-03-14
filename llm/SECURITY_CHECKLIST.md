# Security Checklist (Logical Safety)

Use this checklist for every PR/change that touches data access or writes.

---

## Convex handlers (query/mutation/action/httpAction)

- [ ] Auth required? If yes, unauthenticated fails early.
- [ ] Role gate enforced using central helpers.
- [ ] Ownership verified for every input id.
- [ ] Prior state checked for transitions; repeated transitions rejected.
- [ ] Output is least-privilege (no raw rows, no unnecessary PII).
- [ ] No unbounded `collect()` on growth tables.
- [ ] No `take(N)` used as lookup logic.

---

## Channels / webhooks

- [ ] Idempotency/dedupe with stable message/event ids.
- [ ] Safe fallback replies (localized if user-facing).
- [ ] No raw webhook bodies logged.

---

## AI / agents

- [ ] Orchestrator selects agents; tools are called only inside agents.
- [ ] Tools enforce access/ownership like normal handlers.
- [ ] Prompt context is minimal and structured.
- [ ] No secrets/PII in logs.

Deep reference: `docs/handbook/security/authorization.md`


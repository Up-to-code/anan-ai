# ✅ PR Checklist (Anan Platform)

> This repo is private/closed-source. Do not paste secrets, keys, or customer PII into PR descriptions.

## Summary
- What changed?
- Why did it change?
- Which surfaces are affected? (`web`, `admin`, `mobile`, `convex`, `channels`)

## 🔒 Authorization (AuthZ)
- [ ] Auth required? If yes: unauthenticated callers fail early with a stable error.
- [ ] Role gate enforced (reject-by-default on unknown roles).
- [ ] Row-level ownership verified for every input id.
- [ ] State transitions verify prior state (no repeated accept/apply/duplicate deals).
- [ ] Output is least-privilege (no raw rows, no unnecessary PII).

## 🧱 Zone boundaries
- [ ] Logic lives in the owning zone/layer (no cross-zone deep imports).
- [ ] Route files and HTTP handlers remain thin (delegate to services).

## ⚡ Performance
- [ ] No unbounded `collect()` on tables that can grow.
- [ ] No `take(N)` correctness traps for lookup/recipient resolution.
- [ ] Aggregations use summary queries (not list-then-reduce).
- [ ] Search uses search indexes (`searchIndex` + `withSearchIndex`) where applicable.

## 🌐 Webhooks / Channels (if touched)
- [ ] Idempotency/dedupe implemented (replay-safe).
- [ ] Safe fallbacks for vendor failures.
- [ ] No raw request bodies or prompts logged.

## 🧪 Tests
- [ ] Added/updated tests that lock the changed invariants.
- [ ] `pnpm test:once` passes.

## 📚 Docs
- [ ] Updated `docs/handbook/**` when rules/architecture changed.
- [ ] Updated `CONVEX_RULES.md` if backend rules changed.


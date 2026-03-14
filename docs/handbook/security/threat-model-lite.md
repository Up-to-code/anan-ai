# Threat Model (Lite)

---

## WHY

This repo is a private, closed-source platform, but “private repo” is not a security model.

We need a lightweight threat model to keep engineering decisions consistent:

- what we protect,
- who can do what,
- and which mistakes become incidents.

---

## WHAT

Primary threat categories for Anan:

1. **Authorization bypass**
   - caller reads/mutates data they don’t own.
2. **Role confusion**
   - `RED` vs `developer` vs `user` handled inconsistently.
3. **PII leakage**
   - logs or responses include emails, phone numbers, message bodies.
4. **Webhook replay**
   - webhook retries produce duplicate writes/replies.
5. **Prompt/context leakage**
   - AI tools reveal secrets or internal system prompts.
6. **Scale correctness bugs**
   - `take(N)` or scans break behavior as data grows.

---

## HOW (Mitigations)

Mitigation rules are codified in:

- `CONVEX_RULES.md` (backend rules and checklists),
- `docs/handbook/security/authorization.md` (authZ patterns),
- `.github/PULL_REQUEST_TEMPLATE.md` (merge-time checklists).

If a new feature introduces a new threat category, update these docs in the same PR.


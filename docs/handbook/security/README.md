# Security & Authorization (Logical Safety)

This chapter is about **logical correctness and security**, not TypeScript.

---

## WHY

Most “real” production incidents happen when code:

- forgets to check permissions for a specific user,
- trusts caller-supplied ids,
- leaks fields across roles,
- or is correct for 10 rows but breaks at 10,000 (pagination / `take(N)` traps).

This chapter defines the rules and checklists to prevent those mistakes.

---

## WHAT

This folder documents:

- authorization patterns (authn + role gates + row ownership),
- threat model (lite) and common failure modes,
- test invariants that must be locked,
- GitHub governance patterns to reduce unsafe merges.

---

## HOW (Reading order)

1. `docs/handbook/security/authorization.md`
2. `docs/handbook/security/test-invariants.md`
3. `docs/handbook/security/threat-model-lite.md`
4. `docs/handbook/security/github.md`
5. `docs/handbook/security/team-management.md`

Cross references:

- Backend “God rules”: `CONVEX_RULES.md`
- Zone boundaries: `ARCHITECTURE.md` and `convex/*/ZONE_README.md`

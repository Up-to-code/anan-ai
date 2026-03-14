# GitHub Governance (Private Repo)

---

## WHY

Most security regressions are “review failures”, not implementation failures.

GitHub governance helps by forcing:

- clear ownership of zones,
- a consistent PR checklist,
- explicit security reporting paths for a private repo.

---

## WHAT

This repo uses:

- `CODEOWNERS` (placeholders until handles/teams are filled),
- PR template checklists,
- issue templates for bugs and security concerns,
- a private `SECURITY.md` reporting doc.

Paths:

- `.github/CODEOWNERS`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/SECURITY.md`

---

## HOW (Recommended branch protection)

When you configure GitHub settings (outside this repo), enforce:

1. Require PRs for `main`.
2. Require approvals (CODEOWNERS review).
3. Require status checks (build + tests).
4. Restrict who can push to protected branches.

These settings are not stored in code; the repo provides the docs and ownership files.

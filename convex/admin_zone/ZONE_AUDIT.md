# `admin_zone` Audit

## Current Boundary Risks
- `users.ts`, `organizations.ts`, and `analytics.ts` are all large enough to merit future splitting.
- The zone has many top-level files, which is workable for now but makes discoverability harder without a strong register.

## SOLID Findings
- The privileged boundary is clear, but several handlers combine projection shaping, filtering, and mutation orchestration in one module.
- `services/` already exists and should absorb more pure helper logic over time.

## Cleanup Decisions In This Pass
- Keep the admin surface in root feature files and document them clearly.
- Do not create a synthetic barrel yet; the feature files themselves are the stable admin contract.

## Deferred Follow-Ups
- Split `users.ts` by read-model vs mutation concerns.
- Split `organizations.ts` into detail, memberships/invites, and destructive operations modules.
- Move more shaping/filtering logic into `services/` where it reduces handler size safely.

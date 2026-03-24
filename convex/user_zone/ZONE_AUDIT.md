# `user_zone` Audit

## Current Boundary Risks
- `whatsapp/index.ts` carries too much orchestration in one place.
- Mobile and WhatsApp are cleanly separated, but channel-specific helpers can still become too coupled to internal formatting/state details.

## SOLID Findings
- The zone already has a healthy subzone split (`mobile/` vs `whatsapp/`).
- Single-responsibility pressure is concentrated in WhatsApp reply orchestration.

## Cleanup Decisions In This Pass
- Keep `mobile/` and `whatsapp/` as the stable user-facing entry surfaces.
- Document internal flow/state/formatter files as internal implementation details.

## Deferred Follow-Ups
- Split `whatsapp/index.ts` into reply assembly, policy checks, and state-transition collaborators.

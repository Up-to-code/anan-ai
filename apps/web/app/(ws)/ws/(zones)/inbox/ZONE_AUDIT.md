# Workspace UI `inbox` Audit

## Current Boundary Risks
- `InboxComposer.tsx`, `useRealtimeInbox.ts`, and `InboxWorkspaceClient.tsx` are the largest local modules.
- The zone is highly interactive, so state, keyboard handling, realtime transport, and UI rendering can easily collapse into a few oversized files.

## SOLID Findings
- The dedicated `pages/InboxPage/` folder is the right boundary.
- The next cleanup pressure is splitting large interactive modules into smaller hooks/components without leaking them outside the zone.

## Cleanup Decisions In This Pass
- Moved the inbox page module under `pages/` while keeping the rest of the zone intentionally page-heavy.

## Deferred Follow-Ups
- Split `InboxComposer.tsx` and `useRealtimeInbox.ts` if additional behavior continues to accumulate.

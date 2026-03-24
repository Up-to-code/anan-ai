# Workspace UI `inbox` Audit

## Current Boundary Risks
- `InboxComposer.tsx`, `useRealtimeInbox.ts`, and `InboxWorkspaceClient.tsx` are the largest local modules.
- The zone is highly interactive, so state, keyboard handling, realtime transport, and UI rendering can easily collapse into a few oversized files.

## SOLID Findings
- The dedicated `InboxPage/` folder is the right boundary.
- The next cleanup pressure is splitting large interactive modules into smaller hooks/components without leaking them outside the zone.

## Cleanup Decisions In This Pass
- Added root zone docs, register, and audit files to make the inbox surface readable from outside.

## Deferred Follow-Ups
- Split `InboxComposer.tsx` and `useRealtimeInbox.ts` if additional behavior continues to accumulate.

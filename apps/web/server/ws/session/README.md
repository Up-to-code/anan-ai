## Workspace Session Helpers

This folder owns workspace-scoped session reconstruction.

- `index.ts`: restores broker or developer owner context into the current workspace session.

Use this from `capabilities/*` only. `zones.ts` remains the public entrypoint for external consumers.

## Admin API Loaders

This folder owns admin-facing page loaders and write actions.

- Files here stay thin and session-aware.
- Repository wiring belongs here, while Convex transport details stay in `admin/server/infrastructure/convex/`.
- Admin-only writes should always resolve auth through `@/server/auth/guards`.

Keep branching shallow: when a loader starts growing, extract the tab-specific logic into focused helpers.

# Admin App

Standalone Next.js admin console for Anan platform operations.

## Responsibilities

- Overview and platform health
- User management
- Property management
- Order management
- Knowledge management
- Diagnostics

## Architecture

- `app/` contains thin App Router entrypoints only.
- `admin_zone/api/` contains admin-scoped server APIs.
- `admin_zone/pages/` contains page orchestrators and page-local structure.
- `server/infrastructure/convex/` contains repository adapters that call `convex/admin_zone/*`.
- `components/shell/` contains the workspace-style admin chrome.
- `components/shared/` contains reusable admin primitives used by page modules.

## Deployment

- Vercel: see [DEPLOY.md](DEPLOY.md) for project settings and env checklist.

## References

- Deep handbook: `docs/handbook/admin/README.md`
- Convex rules: `CONVEX_RULES.md`
- Repo architecture rules: `ARCHITECTURE.md`

# Admin App

Standalone Next.js admin console for Anan platform operations.

## Internal Developer Docs

Use the in-app `/docs` admin section as the canonical internal-developer entrypoint for this app and the wider platform.

The deep canonical handbook lives in markdown under `docs/handbook/**`. The in-app `/docs` routes are a curated mirror with pointers.

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
- `components/shared/` contains copied institutional UI primitives adapted from `web/`.

## Deployment

- Vercel: see [DEPLOY.md](DEPLOY.md) for project settings and env checklist.

## References

- Deep handbook: `docs/handbook/admin/README.md`
- Convex rules: `CONVEX_RULES.md`
- Repo architecture rules: `ARCHITECTURE.md`

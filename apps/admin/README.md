# Admin App

Standalone Next.js admin console for Anan platform operations.

## Local Development

- Default local URL: `http://localhost:3001`
- `pnpm dev:admin` starts the admin app on port `3001` so it does not collide with the main web app on `3000`

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

## Password Admin Bootstrap

Admin sign-up is disabled unless it comes through the trusted admin invite bridge. To create the first email/password admin account, set `ADMIN_SIGNUP_BRIDGE_SECRET` and `ADMIN_BOOTSTRAP_SECRET` on the Convex deployment, then run:

```sh
ADMIN_BOOTSTRAP_EMAIL=admin@example.com \
ADMIN_BOOTSTRAP_PASSWORD='Use-A-Strong-Password-123!' \
ADMIN_BOOTSTRAP_NAME='Admin User' \
ADMIN_BOOTSTRAP_SECRET='the-same-secret-set-in-convex' \
ADMIN_SIGNUP_BRIDGE_SECRET='the-same-bridge-secret-set-in-convex' \
CONVEX_SITE_URL='https://your-deployment.convex.site' \
pnpm admin:bootstrap-password
```

Additional admins should use `/signup?token=...` with an admin invite token or be granted through the profile platform-access workflow.

## References

- Deep handbook: `docs/handbook/admin/README.md`
- Convex rules: `CONVEX_RULES.md`
- Repo architecture rules: `ARCHITECTURE.md`

# Web app: Vercel deployment

Monorepo layout: this app lives at `apps/web`. It imports the shared AG UI package from `packages/ag-ui` and Convex generated types from the repo root, so Vercel must install from the workspace context even when the deployed surface is only the web app.

## Checklist before first deploy

| Item | Action |
|------|--------|
| Vercel project scope | Deploy only `apps/web`; do not use the root `pnpm build` command for this project. |
| Root Directory | Prefer setting **Root Directory** to `apps/web`. If the project is kept at the repo root, set **Build Command** to `pnpm build:web`. |
| Install command | Use defaults first. If workspace dependencies are missed, use `cd ../.. && pnpm install --frozen-lockfile` when Root Directory is `apps/web`, or `pnpm install --frozen-lockfile` when Root Directory is the repo root. |
| Build command | With Root Directory `apps/web`, use `pnpm run build`. With repo-root deployment, use `pnpm build:web`. |
| Convex prod deployment | Set `NEXT_PUBLIC_CONVEX_URL` to the production Convex deployment URL. `CONVEX_URL` may be set as the same fallback. |
| Uploads | Set `UPLOADTHING_TOKEN` only when project uploads should be enabled in production. |
| Analytics | Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` only when browser analytics should be enabled. |

## Why this matters

The repo-level `pnpm build` intentionally builds every app:

```bash
pnpm build:web
pnpm build:client-web
pnpm build:marketing
pnpm build:admin
pnpm build:docs
pnpm build:private-docs
```

That is useful as a local full-repo gate, but it is too broad for the workspace web Vercel project. A web deployment should stop after `pnpm build:web`; otherwise Vercel can spend time building unrelated apps and fail because of an unrelated app.

## Local verification

From the repo root:

```bash
pnpm build:web
```

This should complete the production build for `apps/web` without building the buyer app, marketing site, admin app, docs, or private docs.

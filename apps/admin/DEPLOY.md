# Admin app: Vercel deployment

Monorepo layout: this app lives at `apps/admin`. Convex `_generated` is at repo root and is committed; no codegen step is required on Vercel.

## Checklist before first deploy

| Item | Action |
|------|--------|
| Convex prod deployment | Run `npx convex deploy` and note the deployment URL. |
| Vercel env | Set `NEXT_PUBLIC_CONVEX_URL` (and optionally `CONVEX_URL`) to that URL. |
| Root Directory | In Vercel project settings, set **Root Directory** to `apps/admin`. |
| Build / install | Use defaults; override **Install Command** to `cd ../.. && pnpm install` only if deps are missing. |
| pnpm scripts | Leave as-is unless you hit sharp/optimization or other script-related errors. |

## Required environment variable

- **`NEXT_PUBLIC_CONVEX_URL`** — Production Convex deployment URL (e.g. `https://<deployment>.convex.cloud`). Inlined at build time via `next.config.ts`. Without it, the app builds but Convex calls fail at runtime.

See `.env.example` in this directory for a template.

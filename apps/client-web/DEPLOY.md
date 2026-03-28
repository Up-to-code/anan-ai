# Client web app: production deployment

Monorepo layout: this app lives at `apps/client-web`. Convex `_generated` is committed at repo root, so Vercel does not need a codegen step for this app.

## Checklist before first deploy

| Item | Action |
|------|--------|
| Convex prod deployment | Run `npx convex deploy` and note the production deployment URL. |
| Convex auth/site env | Make sure the production auth/site envs used by Convex are configured for the public buyer origin. |
| Vercel env | Set `NEXT_PUBLIC_CONVEX_URL`. Also set `SITE_URL` or `NEXT_PUBLIC_SITE_URL` to the final public origin for metadata and auth-safe URLs. |
| Analytics env | Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` if launch analytics should be enabled. |
| Root Directory | In Vercel project settings, set **Root Directory** to `apps/client-web`. |
| Install command | Use defaults first. If the workspace install is missed, use `cd ../.. && pnpm install`. |

## Required environment variables

- `NEXT_PUBLIC_CONVEX_URL`
  Production Convex deployment URL such as `https://<deployment>.convex.cloud`.
- `SITE_URL` or `NEXT_PUBLIC_SITE_URL`
  Public client-web origin such as `https://clients.example.com`.

## Optional but recommended environment variables

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`
  Enables buyer funnel analytics in the browser.
- `NEXT_PUBLIC_POSTHOG_HOST`
  PostHog ingestion host, typically `https://us.i.posthog.com`.

## Build and runtime commands

- Build: `pnpm --filter client-web build`
- Start: `pnpm --filter client-web start`
- Lint: `pnpm --filter client-web lint`
- Test: `pnpm --filter client-web test`

## Launch smoke checks

1. Open `/` and confirm the assistant shell loads without console/runtime errors.
2. Submit a buyer prompt and confirm a live assistant response returns from Convex.
3. Open `/search` and `/loans` and confirm route-specific suggestions still work.
4. Open `/app/property/<published-id>` and confirm a published property renders without demo fallback behavior.
5. Confirm `/signin` returns safely to an internal route only.
6. Confirm advisor handoff requires auth, then succeeds for an authenticated buyer.
7. Confirm `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest` resolve on the deployed host.

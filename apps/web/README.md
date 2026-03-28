# Web App (`apps/web`)

This is the primary Next.js surface for:

- public pages (`app/(public)`), and
- the broker/developer workspace (`app/(ws)`).

---

## WHY

The web app has two competing needs:

- public routes should be fast, SSR/static-friendly, and low-JS,
- workspace routes are personalized and often real-time.

The architecture exists to keep those needs compatible instead of turning the whole app into “client-by-default”.

---

## WHAT

Key layers:

- `app/**` — App Router entrypoints (keep thin)
- `components/**` — shared UI surfaces (server components by default)
- `server/**` — web backend gateway (auth, contracts, domains, Convex adapters)

---

## HOW (Structure)

### App Router

- `app/(public)/**` — public pages (prefer SSR/static)
- `app/(ws)/**` — workspace pages (provider-backed, dynamic)
- `app/api/**` — thin route handlers delegating to `server/**`

### Web backend gateway

`server/**` owns:

- `server/auth/**` — session + role context
- `server/contracts/**` — DTOs + zod validation + stable error shapes
- `server/domains/**` — business orchestration per domain
- `server/infrastructure/convex/**` — repository adapters calling Convex functions

---

## Commands

From repo root:

```bash
pnpm dev:web
pnpm build:web
```

## Project Uploads Setup

To make `/ws/projects/create` uploads work end-to-end in dev:

1. Set web env vars (`apps/web/.env.local`):
   - `NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud`
   - `UPLOADTHING_TOKEN=<your-uploadthing-token>`
   - `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=<your-posthog-project-token>`
   - `NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com`
2. Set Convex deployment env var (active `dev:*` deployment):
   - `npx convex env set UPLOADTHING_API_KEY <your-uploadthing-api-key> --deployment dev:<name>`
   - `npx convex env set NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN <your-posthog-project-token> --deployment dev:<name>`
   - `npx convex env set NEXT_PUBLIC_POSTHOG_HOST https://us.i.posthog.com --deployment dev:<name>`
3. Quick verification:
   - Start web + Convex dev.
   - Open `/ws/projects/create`.
   - Upload an image in "المعرض المرئي", fill required fields, and save.
   - Confirm redirect to `/ws/projects/<id>` and that uploaded media renders.

E2E note:
- `PLAYWRIGHT_WS_STORAGE_STATE` (optional, test-only): absolute path to a pre-authenticated Playwright storage state file used by `tests/projects-upload.spec.ts`.

Analytics note:
- Public and workspace surfaces emit PostHog browser events from the root layout.
- Convex emits backend order/AI analytics only when the same PostHog env vars are also present in Convex env.

---

## References

- Deep handbook: `docs/handbook/web/README.md`
- Web server gateway overview: `apps/web/server/README.md`
- Repo rules: `ARCHITECTURE.md`

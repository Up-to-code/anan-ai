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

---

## References

- Deep handbook: `docs/handbook/web/README.md`
- Web server gateway overview: `apps/web/server/README.md`
- Repo rules: `ARCHITECTURE.md`


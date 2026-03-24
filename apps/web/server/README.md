## Web Server Layer

This folder is the Next.js backend gateway for the web app.

- `auth/` resolves the signed-in user and role context.
- `domains/` contains application services per business domain.
- `contracts/` defines stable DTOs, validation, and error shapes.
- `infrastructure/convex/` adapts domain services to Convex-backed storage and queries.

Route handlers under `web/app/api/*` must stay thin and delegate here.

## Zone Docs

For zone-specific work, start at:

- `apps/web/server/ws/README.md`
- `apps/web/server/broker_zone/README.md`
- `apps/web/server/red_zone/README.md`

Each of those zones now also has `ZONE_REGISTER.md` and `ZONE_AUDIT.md` beside the code.

## Deep references

- Web handbook: `docs/handbook/web/server-gateway.md`
- SSR/perf rules: `docs/handbook/web/ssr-performance.md`
- Convex rules: `CONVEX_RULES.md`

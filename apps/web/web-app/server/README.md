## Web Server Layer

This folder is the Next.js backend gateway for the web app.

- `auth/` resolves the signed-in user and role context.
- `domains/` contains application services per business domain.
- `contracts/` defines stable DTOs, validation, and error shapes.
- `infrastructure/convex/` adapts domain services to Convex-backed storage and queries.

Route handlers under `web/app/api/*` must stay thin and delegate here.

# Web API Routes (`apps/web/app/api/**`)

---

## WHY

Route handlers are an integration boundary. If handlers contain business logic, you get:

- duplicate behavior across routes,
- inconsistent auth checks,
- no reusable contracts,
- and performance regressions.

---

## WHAT

Rules for writing Next.js route handlers under `apps/web/app/api/**`:

- stay thin,
- validate inputs,
- delegate to `apps/web/server/**`,
- return stable errors.

---

## HOW (Checklist)

For any `route.ts`:

1. Validate request inputs (body/query params) using a shared contract schema.
2. Resolve session/role via the server auth helpers.
3. Call exactly one domain service (or a small orchestrator that calls domain services).
4. Convert domain errors into stable HTTP responses.
5. Avoid manual caching footguns: explicitly set cache headers if the endpoint is user-specific.

---

## Where to change code

- Routes: `apps/web/app/api/**`
- Domain services: `apps/web/server/domains/**`
- Contracts: `apps/web/server/contracts/**`


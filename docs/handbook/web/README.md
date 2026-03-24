# Web Handbook (Workspace + Public)

---

## WHY

The web app has two fundamentally different needs:

1. **Public pages** should be fast, static/SSR-first, and low-JS.
2. **Workspace pages** are personalized and often real-time, and can be dynamic.

Without explicit rules, the app becomes “client-by-default” and loses SSR performance.

---

## WHAT

This chapter explains:

- Next.js App Router structure and route groups,
- server components vs client components,
- provider scoping and SSR performance,
- the web backend gateway layer under `apps/web/server/**`,
- how API route handlers stay thin and delegate to the server layer,
- where the web server and workspace zones live.

---

## HOW (Mental model)

### Two planes: rendering and data ownership

Rendering plane (Next):

- server components for content and SSR,
- client components only when hooks/state/event handlers are required.

Data ownership plane:

- web-only orchestration belongs in `apps/web/server/**`,
- shared business logic belongs in `convex/shared_logic/**`,
- web routes call server services; server services call Convex via repository adapters.

---

## Where to change code

- App Router: `apps/web/app/**`
- Shared UI: `apps/web/components/**`
- Web backend gateway: `apps/web/server/**`
- Web API routes: `apps/web/app/api/**` (thin controllers)
- Web zone map: `docs/handbook/web/zones.md`

---

## Local zone docs first

When the task is zone-specific, start at the local zone doc before reading deeper files:

- `apps/web/server/ws/README.md`
- `apps/web/server/broker_zone/README.md`
- `apps/web/server/red_zone/README.md`
- `apps/web/app/(ws)/ws/(zones)/crm/README.md`
- `apps/web/app/(ws)/ws/(zones)/projects/README.md`
- `apps/web/app/(ws)/ws/(zones)/offers/README.md`
- `apps/web/app/(ws)/ws/(zones)/market/README.md`
- `apps/web/app/(ws)/ws/(zones)/inbox/README.md`

---

## Common pitfalls

- Adding `"use client"` to whole pages to use a small animation or one hook.
- Mounting global providers at the root layout and forcing every public route to be dynamic.
- Fetching data inside JSX instead of via domain services/contracts.
- Importing route-zone internals from another zone when the server layer or a deliberate shared component should be the boundary.

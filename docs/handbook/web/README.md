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
- how API route handlers stay thin and delegate to the server layer.

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

---

## Common pitfalls

- Adding `"use client"` to whole pages to use a small animation or one hook.
- Mounting global providers at the root layout and forcing every public route to be dynamic.
- Fetching data inside JSX instead of via domain services/contracts.


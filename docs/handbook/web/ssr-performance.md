# SSR Performance Rules (Web)

---

## WHY

Performance comes from:

- less client JS,
- fewer backend calls,
- fewer repeated reads within one request,
- and pushing aggregation into dedicated summary queries.

SSR is not “rendering on the server once”; it is a discipline across components, providers, and data access.

---

## WHAT

Practical SSR/performance rules that match the current repo architecture:

- provider scoping (public vs workspace),
- server components by default,
- request-scoped caching for repeated session + workspace lookups,
- summary queries instead of list-then-reduce,
- when to force dynamic rendering.

---

## HOW (Rules)

### Provider scoping

- Public routes should not inherit workspace-only providers.
- Workspace routes can be dynamic and provider-backed.

### Server components

- Presentational components should be server components unless they require hooks/event handlers.
- If an animation library forces client boundaries, isolate it into a tiny wrapper.

### Request-scoped caching

If a server-side request repeatedly resolves the same session/org context:

- cache that resolution per request (React `cache()` is the recommended pattern in this repo).

### Summary reads

Replace:

- list everything → reduce/sum in JS

with:

- backend summary queries that return the aggregate in one call.

### Force dynamic where correct

If a page is personalized, mark it dynamic explicitly rather than “accidentally dynamic”.

---

## Where to change code

- Layout/provider placement: `apps/web/app/**`
- Caching boundaries: `apps/web/server/**`
- Convex summary queries: `convex/shared_logic/**`


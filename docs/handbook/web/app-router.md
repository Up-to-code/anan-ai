# Next.js App Router Rules (Server vs Client)

---

## WHY

In App Router, `"use client"` is contagious: if you mark a file client, you pull more JS into the bundle and you lose server-only optimizations.

The public site must stay SSR/static-friendly. The workspace can be dynamic, but should still avoid unnecessary client boundaries.

---

## WHAT

Rules for:

- server components vs client components,
- route groups and layouts (`(public)` vs `(ws)`),
- where providers belong,
- and when to force dynamic rendering.

---

## HOW (Rules)

### Server component by default

Use a server component when:

- no React hooks are needed,
- the component is presentational,
- the logic is pure rendering.

Only use `"use client"` when:

- you need hooks (`useState`, `useEffect`, Convex hooks),
- you need DOM events (`onClick`, form state),
- you need a client-only library (e.g., framer-motion), and you cannot isolate it to a small wrapper.

### Route groups

Typical structure:

- `apps/web/app/(public)/**` — public pages (SSR/static).
- `apps/web/app/(ws)/**` — workspace pages (dynamic/personalized).

Providers should be scoped to the minimal route group that needs them.

### Providers

Rule:

- Do not mount realtime/auth providers in the global root layout if public routes do not need them.
- Mount providers in workspace-only layouts and in specific auth routes (e.g., sign-in) that require them.

### Force dynamic when appropriate

If a route is personalized and should never be static (e.g., workspace overview), explicitly declare dynamic rendering.

---

## Where to change code

- Root layout: `apps/web/app/layout.tsx`
- Workspace layout: `apps/web/app/(ws)/layout.tsx`
- Public layouts: `apps/web/app/(public)/**`

---

## Common pitfalls

- Turning a whole landing page into a client component to animate one block.
- Using client-only buttons for navigation when a server-only link variant is enough.


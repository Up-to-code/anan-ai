# Mobile Convex Wiring (Env + Providers + DTO Rules)

---

## WHY

Mobile buyer runtime is backend-required. If wiring is implicit, teams accidentally ship mock-only assumptions into production.

---

## WHAT

This chapter documents:

- required environment variables,
- provider behavior,
- and DTO mapping rules for mobile.

---

## HOW

### Environment variable

- `EXPO_PUBLIC_CONVEX_URL` — Convex deployment URL for the mobile app.

### Provider behavior (repo pattern)

The mobile app validates `EXPO_PUBLIC_CONVEX_URL` at boot. When the value is valid, the app mounts the Convex provider and buyer routes. When it is missing or invalid, the app shows one blocking setup screen instead of rendering mock buyer data.

Reference:

- `apps/mobile/src/lib/convex.tsx`
- `apps/mobile/src/lib/convexApi.ts`

### DTO rules

1. Convex endpoints should return mobile-focused projections.
2. Mobile hooks should map those projections into UI DTOs.
3. UI components should not know about raw DB fields.

---

## Common pitfalls

- Treating `EXPO_PUBLIC_CONVEX_URL` absence as “no-op” and then mixing mock and real data silently.
- Building mobile UI around mock-only fields that the backend never returns.

# Mobile Convex Wiring (Env + Providers + DTO Rules)

---

## WHY

Mobile must work in two modes:

- **live backend mode** when `EXPO_PUBLIC_CONVEX_URL` is configured,
- **UI development mode** when backend is not configured.

If wiring is implicit, teams accidentally ship mock-only assumptions into production.

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
- `EXPO_PUBLIC_CLIENT_WEB_URL` — client-web origin used for sign-in escalation, saved-history sync, and advisor handoff completion.

### Provider behavior (repo pattern)

The mobile app wraps children in a Convex provider when the environment is configured, and otherwise becomes a pass-through wrapper so local UI work can still run.

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

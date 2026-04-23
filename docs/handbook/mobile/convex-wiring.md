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
- `EXPO_PUBLIC_CONVEX_SITE_URL` — Convex HTTP/site URL used by Better Auth's Expo session bridge.

The mobile app loads exactly one env file through `apps/mobile/scripts/withRootEnv.mjs`.
By default that file is the repo root `.env.local`. For a private env file outside the
repo, copy `apps/mobile/.env.example` somewhere safe, edit it there, then run:

```bash
ANAN_MOBILE_ENV_FILE=/absolute/path/to/anan-mobile.env pnpm mobile:dev
```

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

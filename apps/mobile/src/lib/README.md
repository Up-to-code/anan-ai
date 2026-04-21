# Mobile Lib

Shared helpers and wiring for the mobile app.

- `convex.tsx` exposes the live Convex provider wrapper used by the backend-required app shell.
- `convexApi.ts` recreates a local `anyApi`-style proxy for Expo when live wiring returns.
- `mobileData.ts` maps live DTOs and builds runtime-safe assistant/view helpers.
- `mobilePersistence.ts` stores the guest transcript on device between app and browser transitions.
- `mobileFallbackData.ts` isolates legacy mock adapters outside the shipped runtime import graph.
- `mvp/` contains deterministic legacy helpers kept only for tests and historical development utilities.
- `rtl.ts` remains available for any explicit layout helpers.

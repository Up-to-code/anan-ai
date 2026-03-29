# Mobile Lib

Shared helpers and wiring for the mobile app.

- `convex.tsx` exposes an optional Convex provider wrapper.
- `convexApi.ts` recreates a local `anyApi`-style proxy for Expo when live wiring returns.
- `mobileData.ts` maps live DTOs, builds auth-bridge payloads, and exposes explicit fallback adapters.
- `mobilePersistence.ts` stores the guest transcript on device between app and browser transitions.
- `mvp/` contains the deterministic guest-mode catalog, assistant logic, and formatting helpers.
- `rtl.ts` remains available for any explicit layout helpers.

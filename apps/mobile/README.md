# Anan Mobile

Expo-managed buyer app for the live buyer-facing Anan mobile surface.

- `app/` keeps Expo Router entrypoints thin.
- `src/features/` owns screen orchestration for chat, search, and property detail.
- `src/components/chat/` contains the shared buyer-assistant UI building blocks.
- `src/hooks/` owns live feed/detail/assistant orchestration plus guest transcript persistence.
- `src/lib/` contains Convex wiring, buyer-assistant helpers, and runtime-safe mobile mappings.
- `src/lib/mvp/` and related mock helpers remain in the repo only as non-runtime legacy/test scaffolding.

The mobile UI follows the Arabic-first Anan system: Cairo typography, crisp surfaces, blue-led brand accents, and motion kept deliberately light.

## Commands

From repo root:

```bash
pnpm mobile:dev
pnpm mobile:typecheck
pnpm --dir apps/mobile test
```

## Required mobile env

- Root env source of truth: [`.env.local`](/Users/ahmedmansour/anan-lit/.env.local)
- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` for app boot and Clerk mobile auth
- `CLERK_PUBLISHABLE_KEY` is also supported locally as a compatibility fallback
- `EXPO_PUBLIC_CONVEX_URL` is required for buyer routes; without it the app shows one blocking setup screen instead of fallback data
- When the root env already defines `CONVEX_URL`, the mobile dev wrapper reuses it as `EXPO_PUBLIC_CONVEX_URL` automatically
- `CLERK_SECRET_KEY` and `CLERK_JWT_ISSUER_DOMAIN` stay server/cloud env values and must not be exposed as `EXPO_PUBLIC_*`

## Convex env sync

Push Clerk envs to the active Convex deployment with:

```bash
npx convex env set CLERK_PUBLISHABLE_KEY <your-clerk-publishable-key> --deployment dev:<name>
npx convex env set CLERK_SECRET_KEY <your-clerk-secret-key> --deployment dev:<name>
npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-clerk-jwt-issuer-domain> --deployment dev:<name>
```

For this repo, the active dev deployment is typically declared in the root [`.env.local`](/Users/ahmedmansour/anan-lit/.env.local) as `CONVEX_DEPLOYMENT`.

## References

- Mobile handbook: `docs/handbook/mobile/README.md`
- Mobile architecture: `docs/handbook/mobile/architecture.md`
- Mobile AI UX principles: `docs/handbook/mobile/ai-ux-principles.md`

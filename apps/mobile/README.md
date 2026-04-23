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

- One env file is loaded by the mobile wrapper. By default it uses the repo root [`.env.local`](/Users/ahmedmansour/anan-lit/.env.local)
- To keep your mobile env outside the repo, copy [`.env.example`](/Users/ahmedmansour/anan-lit/apps/mobile/.env.example) to a private path, edit it there, and run:

```bash
ANAN_MOBILE_ENV_FILE=/absolute/path/to/anan-mobile.env pnpm mobile:dev
```

- `EXPO_PUBLIC_CONVEX_URL` is required for buyer routes; without it the app shows one blocking setup screen instead of fallback data
- `EXPO_PUBLIC_CONVEX_SITE_URL` is required for Better Auth's Expo session bridge and Convex HTTP auth routes
- When the root env already defines `CONVEX_URL`, the mobile dev wrapper reuses it as `EXPO_PUBLIC_CONVEX_URL` automatically
- When the root env already defines `CONVEX_SITE_URL`, the mobile dev wrapper reuses it as `EXPO_PUBLIC_CONVEX_SITE_URL` automatically

## Convex env sync

Push Better Auth envs to the active Convex deployment with:

```bash
npx convex env set BETTER_AUTH_SECRET <your-better-auth-secret> --deployment dev:<name>
npx convex env set GOOGLE_CLIENT_ID <your-google-client-id> --deployment dev:<name>
npx convex env set GOOGLE_CLIENT_SECRET <your-google-client-secret> --deployment dev:<name>
```

For this repo, the active dev deployment is typically declared in the root [`.env.local`](/Users/ahmedmansour/anan-lit/.env.local) as `CONVEX_DEPLOYMENT`.

## References

- Mobile handbook: `docs/handbook/mobile/README.md`
- Mobile architecture: `docs/handbook/mobile/architecture.md`
- Mobile AI UX principles: `docs/handbook/mobile/ai-ux-principles.md`

# Anan Mobile

Expo-managed buyer app for the live buyer-facing Anan mobile surface.

- `app/` keeps Expo Router entrypoints thin.
- `src/features/` owns screen orchestration for chat, search, and property detail.
- `src/components/chat/` contains the shared buyer-assistant UI building blocks.
- `src/hooks/` owns live feed/detail/assistant orchestration plus guest transcript persistence.
- `src/lib/` contains Convex wiring, browser bridge helpers, and explicit fallback-mode adapters.
- `src/lib/mvp/` remains the explicit UI-development fallback when backend wiring is absent.

The mobile UI follows the Arabic-first Anan system: Cairo typography, crisp surfaces, blue-led brand accents, and motion kept deliberately light.

## Commands

From repo root:

```bash
pnpm mobile:dev
pnpm mobile:typecheck
pnpm --dir apps/mobile test
```

## Required mobile env

- `EXPO_PUBLIC_CONVEX_URL` for live feed + assistant data
- `EXPO_PUBLIC_CLIENT_WEB_URL` for save-history and advisor-handoff sign-in escalation through `client-web`

## References

- Mobile handbook: `docs/handbook/mobile/README.md`
- Mobile architecture: `docs/handbook/mobile/architecture.md`

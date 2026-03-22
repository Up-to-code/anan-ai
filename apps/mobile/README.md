# Anan Mobile

Expo-managed buyer app for the chat-first Anan mobile MVP.

- `app/` keeps Expo Router entrypoints thin.
- `src/features/` owns screen orchestration for chat, search, and property detail.
- `src/components/chat/` contains the shared buyer-assistant UI building blocks.
- `src/hooks/` owns client state and deterministic guest-mode orchestration.
- `src/lib/mvp/` contains the local catalog and mock assistant adapter.

The mobile UI follows the Arabic-first Anan system: Cairo typography, crisp surfaces, blue-led brand accents, and motion kept deliberately light.

## Commands

From repo root:

```bash
pnpm mobile:dev
pnpm mobile:typecheck
```

## References

- Mobile handbook: `docs/handbook/mobile/README.md`
- Mobile architecture: `docs/handbook/mobile/architecture.md`

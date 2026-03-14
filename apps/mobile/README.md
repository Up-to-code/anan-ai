# Anan Mobile

Expo-managed buyer app for the Anan mobile feed MVP.

- `app/` keeps route files thin and delegates to feature folders.
- `src/features/` owns screen-level orchestration.
- `src/components/ui/` contains atomic primitives.
- `src/components/features/` contains feed and assistant-specific building blocks.

The mobile UI follows the sharp Arabic-first Anan system: flat surfaces, blue accents, strong contrast, and RTL-native layout.

## Commands

From repo root:

```bash
pnpm mobile:dev
pnpm mobile:typecheck
```

## References

- Deep handbook: `docs/handbook/mobile/README.md`
- Data/LLM guidance: `docs/llm-data-access-guide.md`
- Repo architecture rules: `ARCHITECTURE.md`

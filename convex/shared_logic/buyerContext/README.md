# Buyer Context

Folder-backed buyer context compiler helpers for channel assistants.

- `types.ts`: shared buyer state and summary type aliases.
- `constants.ts`: validators, summary keys, token budgets, and keywords.
- `handlers/`: folder-local internal Convex queries/mutations behind the stable `../buyerContext.ts` entrypoint.
- `compiler/`: compiled prompt-context assembly and cache orchestration.
- `prompt/`: prompt scoring, selection, and budget helpers.
- `summaries/`: buyer/profile/property summary composition.
- `storage/`: memory, summary, knowledge, and recap loading helpers.
- top-level `compiled.ts`, `helpers.ts`, `summaries.ts`, `storage.ts`: compatibility entry files that re-export the folder modules.
- top-level `../buyerContext.ts`: stable Convex module surface that now re-exports the folder handlers.

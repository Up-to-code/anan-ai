# Buyer Comparisons

Folder-backed shared helpers for public buyer property comparison flows.

- `types.ts`: shared validators and type aliases for resource refs and comparison artifacts.
- `queries.ts`: internal read models for thread refs and stored comparison artifacts.
- `mutations.ts`: internal persistence for resource refs, artifacts, and buyer-state updates.
- `builder.ts`: pure comparison assembly helpers used by the public assistant orchestration layer.

Keep this folder focused on public buyer comparison storage and read/write orchestration. Do not move public assistant session logic here.

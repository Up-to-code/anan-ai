# Workspace Command Router

Folder-backed direct-command routing for workspace assistant asks.

- `index.ts`: top-level command dispatcher.
- `types.ts`: shared command/result DTOs.
- `parse.ts`: deterministic Arabic/English command parsing helpers.
- `format.ts`: AG UI cards and workspace response formatting.
- `data.ts`: owner-scoped Convex reads and shared list helpers.
- `handlers/`: command-family execution paths.

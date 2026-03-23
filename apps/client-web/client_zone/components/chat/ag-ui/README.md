# Client AG UI

Agentic UI renderers for the client web assistant.

- `types.ts` defines the local card prop contracts.
- `registry.ts` maps `componentId` values to client-safe React components.
- `AgUiTurnRenderer.tsx` renders cards in order for a single assistant turn.
- `cards/*` contains presentation-only client cards aligned with the assistant thread.

This layer mirrors the workspace `uiTurn.cards[]` structure without importing workspace-only UI.

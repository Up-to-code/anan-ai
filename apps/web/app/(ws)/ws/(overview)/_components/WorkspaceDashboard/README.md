# WorkspaceDashboard

Workspace assistant surface for `/ws`.

- `index.tsx`: thin page orchestrator that composes the canvas with the workspace assistant hook.
- `WorkspaceAssistantCanvas.tsx`: renders the landing state, active conversation, and composer.
- `useWorkspaceAssistant.ts`: manages draft/thread routing, optimistic sends, and stream lifecycle state.
- Thread history now lives in the shared workspace sidebar rather than a local dashboard rail.

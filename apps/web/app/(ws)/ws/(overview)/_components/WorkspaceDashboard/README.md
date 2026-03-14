# WorkspaceDashboard

Workspace assistant surface for `/ws`.

- `index.tsx`: thin page orchestrator that composes the assistant rail and canvas.
- `WorkspaceAssistantRail.tsx`: renders recent assistant threads and the new-thread action.
- `WorkspaceAssistantCanvas.tsx`: renders the landing state, active conversation, and composer.
- `useWorkspaceAssistant.ts`: manages thread selection, URL sync, optimistic sending, and thread-list refresh.

# Workspace UI `projects` Register

## Top-Level Ownership
- `page.tsx`, `layout.tsx`, `loading.tsx`: route entrypoints
- `ProjectsPage/`: project list workspace
- `ProjectDetailPage/`: project detail UI
- `ProjectFormScreen.tsx`: create/edit form UI
- `projectViewModel.ts`: backend-to-UI mapping helpers
- `projectTypes.ts`: route-facing project types
- `create/`, `[projectId]/`: focused route trees

## Important Exports
- `ProjectsPage`, `ProjectDetailPage`, `ProjectFormScreen`
- `mapPropertyToWorkspaceProject`, `mapWorkspaceProjectToPropertyInput`
- `WorkspaceProject` and related project types

## Main Consumers
- project route entry files
- create/edit/detail route wrappers

## Public Vs Internal
- Public inside the zone: page folders, form screen, view-model/types
- Internal: individual route wrappers under `create/` and `[projectId]/`

# Workspace UI `projects` Register

## Top-Level Ownership
- route files: `page.tsx`, `layout.tsx`, `loading.tsx`, nested route wrappers
- `pages/*`: page orchestrators and page-private UI
- `shared/forms`: create/edit form UI and submission helpers
- `shared/lib`: backend-to-UI mapping helpers
- `types`: route-facing project types
- `create/`, `[projectId]/`: focused route trees

## Important Exports
- page entrypoints under `pages/*/index.tsx`
- `ProjectFormScreen`
- `mapPropertyToWorkspaceProject`, `mapWorkspaceProjectToPropertyInput`
- `WorkspaceProject` and related project types

## Main Consumers
- project route entry files
- create/edit/detail route wrappers

## Public Vs Internal
- Public inside the zone: `pages/`, `shared/`, and `types/`
- Internal: route wrappers under `create/` and `[projectId]/`, plus page-private subcomponents

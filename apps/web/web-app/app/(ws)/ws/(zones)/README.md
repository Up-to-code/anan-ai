# Workspace Zones

This route group contains the focused business-zone screens that still resolve to `/ws/...` URLs.

## Belongs Here
- `projects`
- `offers`
- `crm`
- `ai`

Each zone owns its local `layout.tsx`, `page.tsx`, tests, and page-specific subfolder.

## Stays At `ws` Root
- `/ws` workspace launcher
- `/ws/me` and security/profile routes
- shared `_components`
- shared `_lib`

The `(zones)` folder is a filesystem grouping only. It must not change public route paths.

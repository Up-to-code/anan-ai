# Workspace Zones

This route group contains the focused business-zone screens that still resolve to `/ws/...` URLs.

## Belongs Here
- `projects`
- `offers`
- `crm`
- `market`
- `inbox`
- `inbox`
- `market`

Each zone owns its local `layout.tsx`, `page.tsx`, tests, and page-specific subfolder.

## Zone Docs

Each current workspace zone now owns:

- `README.md` for the canonical local architecture and outside-in usage guide
- `ZONE_REGISTER.md` for the file/function register
- `ZONE_AUDIT.md` for the cleanup backlog and SOLID findings

Read the local zone doc first before jumping into page internals.

## Stays At `ws` Root
- `/ws` workspace launcher
- `/ws/me` and security/profile routes
- shared `_components`
- shared `_lib`

The `(zones)` folder is a filesystem grouping only. It must not change public route paths.

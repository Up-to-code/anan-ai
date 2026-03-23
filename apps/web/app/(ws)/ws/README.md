# Workspace Zone

This folder owns the authenticated `/ws/*` application surface.

## Belongs Here
- workspace-wide shell, nav, drawers, and shared `_components`
- workspace-only `_lib` helpers
- focused business zones under `(zones)`
- overview, settings, profile, and onboarding routes

## Public Surface
- Import stable workspace-shared UI and types from `@/app/(ws)/ws/public`.
- Keep `_components` and `_lib` for workspace-wide concerns only.

## Keep Separate
- business-zone page modules should stay inside their zone folders
- generic primitives remain in `components/ui`
- public marketing and docs UI stay outside this tree

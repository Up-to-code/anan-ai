# ProjectsPage

Thin workspace page composition for the developer `Projects` route.

## Responsibilities
- Render the developer-only `/ws/projects` screen using server-provided RED property data.
- Keep route logic outside the UI tree; the route loads data and passes plain props into this folder.
- Own all page-specific presentation for the v1 projects experience.

## Structure
- `index.tsx`: page orchestrator.
- `ProjectsSummary.tsx`: compact summary strip derived from the loaded property list.
- `ProjectsTable.tsx`: dense table/card presentation for project rows.

## Follow-on Routes
- `/ws/offers`
- `/ws/brokers`

These are reserved as the next developer workspace routes and should reuse the same shell and page-local composition pattern.

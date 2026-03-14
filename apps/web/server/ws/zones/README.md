## Workspace Zones Orchestrator

This folder owns audience-aware workspace dispatch.

- `properties.ts`: broker/developer property capability selection.
- `offers.ts`: broker/developer offer capability selection.
- `crm.ts`: broker/developer CRM capability selection.
- `session.ts`: restores owner context into workspace-scoped sessions.
- `errors.ts`: shared unavailability errors for unsupported audiences.

`../zones.ts` remains the stable public entrypoint for the rest of the app.

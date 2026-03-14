## Workspace Composition

This folder owns workspace-wide server composition for `/ws`.

- `zones.ts` is the stable public entrypoint used by pages and server actions.
- `zones/` contains the focused audience-aware orchestrators for properties, offers, and CRM.
- Shared session reconstruction for workspace owner context lives in `zones/session.ts`.

Keep page loaders thin here: compose broker/developer services once, then delegate to the appropriate zone module.

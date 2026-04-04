## Properties Convex Adapters

This folder owns property and project-related Convex adapters used by workspace and zone services.

- `brokerZone/`: broker-owned property persistence
- `redZone/`: developer-owned property persistence
- `access/`: explicit viewer access management
- `analytics/`: project analytics reads and event tracking
- `sharedDetails/`: viewer-safe property detail reads

Adapters here should expose stable property DTOs and hide Convex module boundaries from the domain layer.

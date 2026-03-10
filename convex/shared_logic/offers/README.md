## Offers Capability

This folder owns shared offer business logic that still runs in Convex during the migration.

- `access.ts`: auth and verification helpers for senders.
- `recipients.ts`: recipient discovery by email or phone.
- `queries.ts`: list/read projections for sent, received, and public offers.
- `mutations.ts`: create, publish, apply, and status transitions.
- `index.ts`: thin capability entrypoint for Convex handlers.

## Agencies Repositories

This folder contains the extracted implementation behind `../repositories.ts`.

- `core.ts`: shared types, owner/profile lookup, and organization record helpers.
- `organization.ts`: organization create/list/get/update flows.
- `membership.ts`: membership resolution, manager access, and team member reads.
- `invites.ts`: invite lifecycle flows and incoming invite reads.
- `directory.ts`: directory search and offers-directory projections.
- `index.ts`: stable module barrel used by the compatibility entrypoint.

The public API should remain unchanged while internal responsibilities stay isolated.

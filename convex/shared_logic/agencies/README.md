## Agencies Capability

This folder owns organization, team, invite, and directory logic shared across the web and Convex layers.

- `repositories.ts` is the stable compatibility entrypoint used by existing callers.
- `repositories/organization.ts` owns organization bootstrap, reads, and updates.
- `repositories/membership.ts` owns membership access rules and team member projections.
- `repositories/invites.ts` owns invite creation, acceptance, cancellation, and incoming invite views.
- `repositories/directory.ts` owns exact directory search and offers-directory projections.
- `repositories/core.ts` owns shared owner/profile utilities used across the capability.

Keep handlers thin here: business rules belong in the focused modules, and `repositories.ts` should only re-export the public surface.

# `admin_zone` Register

## Top-Level Ownership
- Operational projections: `overview.ts`, `analytics.ts`, `charts.ts`, `activities.ts`
- Core admin entities: `users.ts`, `organizations.ts`, `properties.ts`, `banks.ts`, `orders.ts`, `knowledge.ts`, `verifications.ts`
- Support handlers: `notifications.ts`, `threads.ts`, `developers.ts`, `RED.ts`, `tenantsMigration.ts`
- `services/`: admin-internal property and user helpers

## Important Files And Exports
- `users.ts`: user listing/detail/update and related operational queries
- `organizations.ts`: broker/developer org listing and membership/invite admin operations
- `properties.ts`: admin property management surface
- `analytics.ts` and `charts.ts`: dashboard analytics projections
- `services/usersService.ts`: user-focused helper services
- `services/propertiesService.ts`: property-focused helper services

## Main Consumers
- admin app/server loaders and actions
- admin-focused diagnostics/tests

## Public Vs Internal
- Public: root handler files
- Internal: `services/*` and low-level implementation helpers

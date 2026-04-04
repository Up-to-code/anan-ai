# Workspace Server Zone Register

## Top-Level Ownership
- `zones.ts`: stable public gateway
- `capabilities/crm.ts`: workspace CRM dispatcher
- `capabilities/offers.ts`: workspace offers dispatcher
- `capabilities/properties.ts`: workspace property dispatcher
- `session/index.ts`: owner-context aware session reconstruction
- `shared/errors.ts`: unsupported-audience errors

## Important Exports
- `getWorkspaceCrmZone`
- `getWorkspaceOffersZone`
- `getWorkspacePropertyZone`
- `buildWorkspaceScopedSessionResolver`

## Main Consumers
- workspace route files and page loaders
- focused workspace tests

## Public Vs Internal
- Public: `zones.ts`
- Internal: individual dispatcher files and session/error helpers

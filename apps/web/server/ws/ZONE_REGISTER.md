# Workspace Server Zone Register

## Top-Level Ownership
- `zones.ts`: stable public gateway
- `zones/session.ts`: owner-context aware session reconstruction
- `zones/crm.ts`: workspace CRM dispatcher
- `zones/offers.ts`: workspace offers dispatcher
- `zones/properties.ts`: workspace property dispatcher
- `zones/errors.ts`: unsupported-audience errors

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

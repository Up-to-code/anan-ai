# Web Server `red_zone` Register

## Top-Level Ownership
- `index.ts`: root developer server gateway
- `overview/index.ts`: `getRedOverview`
- `properties/index.ts`: developer property CRUD/publish functions
- `offers/index.ts`: developer offer snapshot and lifecycle functions
- `crm/index.ts`: developer deal lifecycle functions
- `organizations/index.ts`: developer org/team functions

## Important Exports
- `getRedOverview`
- `listRedProperties`, `getRedProperty`, `createRedProperty`, `updateRedProperty`, `deleteRedProperty`, `publishRedProperty`
- `getRedOffersSnapshot`, `createRedOffer`, `publishRedOffer`, `respondToRedOffer`, `applyToRedOffer`
- `listRedDeals`, `createRedDeal`, `updateRedDealStage`, `updateRedDealNotes`, `updateRedDealFollowUp`, `addRedDealDocument`
- Organization membership/invite functions from `organizations/index.ts`

## Main Consumers
- `apps/web/server/ws`
- developer-facing routes and server actions

## Public Vs Internal
- Public: root `index.ts` and feature-folder `index.ts` entrypoints
- Internal: implementation details inside each feature folder

# Web Server `broker_zone` Register

## Top-Level Ownership
- `index.ts`: root broker server gateway
- `overview/index.ts`: `getBrokerOverview`
- `properties/index.ts`: broker property CRUD/publish functions
- `offers/index.ts`: broker offer snapshot and lifecycle functions
- `crm/index.ts`: broker deal lifecycle functions
- `organizations/index.ts`: broker org/team functions

## Important Exports
- `getBrokerOverview`
- `listBrokerProperties`, `getBrokerProperty`, `createBrokerProperty`, `updateBrokerProperty`, `deleteBrokerProperty`, `publishBrokerProperty`
- `getBrokerOffersSnapshot`, `createBrokerOffer`, `publishBrokerOffer`, `respondToBrokerOffer`, `applyToBrokerOffer`
- `listBrokerDeals`, `createBrokerDeal`, `updateBrokerDealStage`, `updateBrokerDealNotes`, `updateBrokerDealFollowUp`, `addBrokerDealDocument`
- Organization membership/invite functions from `organizations/index.ts`

## Main Consumers
- `apps/web/server/ws`
- broker-facing routes and server actions

## Public Vs Internal
- Public: root `index.ts` and feature-folder `index.ts` entrypoints
- Internal: implementation details inside each feature folder

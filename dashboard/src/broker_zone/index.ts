/**
 * WHY:   Enforces the Fortress Concept by creating a strict API Gateway.
 * WHAT:  Only the components directly related to Broker Zone functionality are exported.
 * HOW:   Deep imports outside of `src/broker_zone/index.ts` from other zones should be strictly prohibited.
 */

export { BrokerZoneErrorBoundary } from "./errors/ErrorBoundary";

// Pages
export { default as BrokerOverview } from "./pages/Overview";
export { default as BrokerProfile } from "./pages/Profile";
export { default as BrokerCRM } from "./pages/CRM";
export { default as BrokerOffers } from "./pages/Offers";

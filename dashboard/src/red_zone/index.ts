/**
 * WHY:   Enforces the Fortress Concept by creating a strict API Gateway.
 * WHAT:  Only the components directly related to Developer (RED) Zone functionality are exported.
 * HOW:   Deep imports outside of `src/red_zone/index.ts` from other zones should be strictly prohibited.
 */

export { RedZoneErrorBoundary } from "./errors/ErrorBoundary";

// Pages
export { default as RedOverview } from "./pages/Overview";
export { default as RedProfile } from "./pages/Profile";
export { default as RedProjects } from "./pages/Projects";

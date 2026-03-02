/**
 * WHY:   Creates a hard architectural boundary. Other zones (broker, red, public) 
 *        must NEVER deep import from admin_zone/pages or admin_zone/components.
 * WHAT:  Exposes only the entry points and layouts needed by the global React router.
 * HOW:   Exports standard React components.
 */

export { AdminZoneErrorBoundary } from "./errors/ErrorBoundary";

// We will export the refactored pages here once they are moved into their Orchestrator folders.
// Example:
// export { UserDetail } from "./pages/UserDetail";

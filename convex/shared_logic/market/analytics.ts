/**
 * Market analytics: pure snapshot builder used by the Convex shared_logic market query + tests.
 *
 * Kept as a thin orchestrator so external imports remain stable:
 * `import { buildMarketSnapshot } from "./market/analytics"`.
 */

export type { MarketFiltersInput, MarketSnapshotResult } from "./analytics/types";
export { buildMarketSnapshot } from "./analytics/snapshot";

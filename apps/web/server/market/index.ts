import { DomainError } from "@/server/contracts/errors";
import { marketFiltersSchema, type MarketFilters, type MarketSnapshot } from "@/server/contracts/market";
import { getWorkspaceBehaviorForCurrentUser } from "@/server/domains/workspaces/service";
import {
  convexMarketRepository,
  type MarketRepository,
} from "@/server/infrastructure/convex/marketRepository";

type MarketServiceDependencies = {
  getWorkspaceBehavior: () => Promise<{
    capabilities: { canAccessMarket: boolean };
  }>;
  repository: Pick<MarketRepository, "getSnapshot">;
};

const defaultDependencies: MarketServiceDependencies = {
  getWorkspaceBehavior: getWorkspaceBehaviorForCurrentUser,
  repository: convexMarketRepository,
};

/**
 * WHY:   The workspace route should resolve market access and filter validation in one server-owned function.
 * WHAT:  Returns the Saudi market snapshot for the current workspace user and optional city/area filters.
 * HOW:   Verifies that the current workspace can access the market zone, validates filters, then delegates to the repository.
 */
export async function getWorkspaceMarketSnapshot(
  filters: MarketFilters,
  dependencies: MarketServiceDependencies = defaultDependencies,
): Promise<MarketSnapshot> {
  const workspace = await dependencies.getWorkspaceBehavior();
  if (!workspace.capabilities.canAccessMarket) {
    throw new DomainError({ code: "FORBIDDEN", message: "Market intelligence is unavailable for this workspace", status: 403 });
  }

  const parsedFilters = marketFiltersSchema.parse(filters);
  return dependencies.repository.getSnapshot(parsedFilters);
}

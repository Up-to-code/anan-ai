import { assertDeveloperSession, requireDeveloperSession } from "@/server/auth/guards";
import { type ResolvedSession } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import type { DeveloperOverviewSummary } from "@/server/contracts/properties";
import {
  convexRedZoneRepository,
  type RedZoneRepository,
} from "@/server/infrastructure/convex/redZoneRepository";

type RedOverviewDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: Pick<RedZoneRepository, "getOverview">;
};

const defaultDependencies: RedOverviewDependencies = {
  requireSession: requireDeveloperSession,
  repository: convexRedZoneRepository,
};

/**
 * WHY:   Developer workspace screens should load overview data through one server-owned entrypoint.
 * WHAT:  Returns the RED overview summary for the current authenticated developer session.
 * HOW:   Requires the session, accepts `developer` or `RED` roles, enforces the RED owner link, then queries Convex.
 */
export async function getRedOverview(
  dependencies: RedOverviewDependencies = defaultDependencies,
): Promise<DeveloperOverviewSummary> {
  const session = assertDeveloperSession(await dependencies.requireSession());
  const redId = session.context.redId;
  if (!redId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Developer profile required", status: 403 });
  }
  return dependencies.repository.getOverview(redId);
}

import { assertBrokerSession, requireBrokerSession } from "@/server/auth/guards";
import { type ResolvedSession } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import type { BrokerOverviewSummary } from "@/server/contracts/properties";
import {
  convexBrokerZoneRepository,
  type BrokerZoneRepository,
} from "@/server/infrastructure/convex/brokerZoneRepository";

type BrokerOverviewDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: Pick<BrokerZoneRepository, "getOverview">;
};

const defaultDependencies: BrokerOverviewDependencies = {
  requireSession: requireBrokerSession,
  repository: convexBrokerZoneRepository,
};

/**
 * WHY:   Broker workspace screens should load overview data through one server-owned entrypoint.
 * WHAT:  Returns the broker overview summary for the current authenticated broker session.
 * HOW:   Requires the session, enforces the broker role plus owner link, then queries the Convex repository.
 */
export async function getBrokerOverview(
  dependencies: BrokerOverviewDependencies = defaultDependencies,
): Promise<BrokerOverviewSummary> {
  const session = assertBrokerSession(await dependencies.requireSession());
  const brokerId = session.context.brokerId;
  if (!brokerId) {
    throw new DomainError({ code: "FORBIDDEN", message: "Broker profile required", status: 403 });
  }
  return dependencies.repository.getOverview(brokerId);
}

import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminCommandCenterRepository } from "@/server/infrastructure/convex/adminCommandCenterRepository";
import { convexAdminAnalyticsRepository } from "@/server/infrastructure/convex/adminAnalyticsRepository";

/**
 * WHY:   Analytics routes should stay thin while still loading distinct chart payloads per tab.
 * WHAT:  Resolves the current admin session and returns the requested analytics dataset.
 * HOW:   Uses the analytics repository to fetch only the data needed for the selected tab.
 */
export async function getAnalyticsPageData(
  tab:
    | "executive"
    | "engagement"
    | "commercial"
    | "ecosystem"
    | "inventory"
    | "collaboration",
  range: "30d" | "90d" = "90d",
) {
  const session = await requireAdminPageSession(`/analytics/${tab}`);
  const token = session.token;

  if (tab === "executive") {
    const [overview, commercial, ecosystem, queue] = await Promise.all([
      convexAdminCommandCenterRepository.getOverview(token, range),
      convexAdminCommandCenterRepository.getCommercialAnalytics(token, range),
      convexAdminCommandCenterRepository.getEcosystemHealthAnalytics(token, range),
      convexAdminCommandCenterRepository.getQueueHealthAnalytics(token, range === "90d" ? "90d" : "30d"),
    ]);
    return { session, tab, data: { overview, commercial, ecosystem, queue } };
  }

  if (tab === "engagement") {
    const [messages, activeUsers] = await Promise.all([
      convexAdminAnalyticsRepository.getMessageAnalytics(token),
      convexAdminAnalyticsRepository.getActiveUsersAnalytics(token),
    ]);
    return { session, tab, data: { messages, activeUsers } };
  }

  if (tab === "commercial") {
    return { session, tab, data: await convexAdminCommandCenterRepository.getCommercialAnalytics(token, range) };
  }

  if (tab === "ecosystem") {
    const [ecosystem, brokers, developers] = await Promise.all([
      convexAdminCommandCenterRepository.getEcosystemHealthAnalytics(token, range),
      convexAdminAnalyticsRepository.getBrokerAnalytics(token),
      convexAdminAnalyticsRepository.getDeveloperAnalytics(token),
    ]);
    return { session, tab, data: { ecosystem, brokers, developers } };
  }

  if (tab === "collaboration") {
    const [connections, queue] = await Promise.all([
      convexAdminAnalyticsRepository.getConnectionAnalytics(token),
      convexAdminCommandCenterRepository.getQueueHealthAnalytics(token, range === "90d" ? "90d" : "30d"),
    ]);
    return { session, tab, data: { connections, queue } };
  }

  const [inventory, brokers, developers] = await Promise.all([
    convexAdminAnalyticsRepository.getPropertyAnalytics(token),
    convexAdminAnalyticsRepository.getBrokerAnalytics(token),
    convexAdminAnalyticsRepository.getDeveloperAnalytics(token),
  ]);
  return { session, tab, data: { inventory, brokers, developers } };
}

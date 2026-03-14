import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminAnalyticsRepository } from "@/server/infrastructure/convex/adminAnalyticsRepository";

/**
 * WHY:   Analytics routes should stay thin while still loading distinct chart payloads per tab.
 * WHAT:  Resolves the current admin session and returns the requested analytics dataset.
 * HOW:   Uses the analytics repository to fetch only the data needed for the selected tab.
 */
export async function getAnalyticsPageData(
  tab: "messages" | "active-30d" | "brokers" | "developers" | "properties" | "offers" | "connections",
) {
  const session = await requireAdminPageSession(`/analytics/${tab}`);
  const token = session.token;

  if (tab === "messages") {
    return { session, tab, data: await convexAdminAnalyticsRepository.getMessageAnalytics(token) };
  }

  if (tab === "active-30d") {
    return { session, tab, data: await convexAdminAnalyticsRepository.getActiveUsersAnalytics(token) };
  }

  if (tab === "brokers") {
    return { session, tab, data: await convexAdminAnalyticsRepository.getBrokerAnalytics(token) };
  }

  if (tab === "developers") {
    return { session, tab, data: await convexAdminAnalyticsRepository.getDeveloperAnalytics(token) };
  }

  if (tab === "offers") {
    return { session, tab, data: await convexAdminAnalyticsRepository.getOfferAnalytics(token) };
  }

  if (tab === "connections") {
    return { session, tab, data: await convexAdminAnalyticsRepository.getConnectionAnalytics(token) };
  }

  return { session, tab, data: await convexAdminAnalyticsRepository.getPropertyAnalytics(token) };
}

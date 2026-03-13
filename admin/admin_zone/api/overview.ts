import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminOverviewRepository } from "@/server/infrastructure/convex/adminOverviewRepository";

/**
 * WHY:   The simplified dashboard section now splits overview, entity summary, and activity summary into focused tabs.
 * WHAT:  Returns the shared dashboard counters and a compact recent-activity feed.
 * HOW:   Requires an admin session once, then loads the overview stats and latest activity in parallel.
 */
export async function getDashboardOverviewPageData() {
  const session = await requireAdminPageSession("/dashboard");
  const token = session.token;

  const [stats, recentActivities] = await Promise.all([
    convexAdminOverviewRepository.getStats(token),
    convexAdminOverviewRepository.listRecentActivities(token, 8),
  ]);

  return {
    session,
    stats,
    recentActivities,
  };
}

import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminDiagnosticsRepository } from "@/server/infrastructure/convex/adminDiagnosticsRepository";

/**
 * WHY:   Diagnostics should render from one admin-focused loader instead of scattered repository calls.
 * WHAT:  Returns logs, error rates, search activity, error health, and channel distribution for the admin dashboard.
 * HOW:   Requires an admin session once, then fetches all diagnostic datasets in parallel.
 */
export async function getAdminDiagnosticsPageData(range: "day" | "week" | "month" = "week") {
  const session = await requireAdminPageSession("/diagnostics");
  const [logs, errorRate, searchActivity, errorHealth, channelDistribution] = await Promise.all([
    convexAdminDiagnosticsRepository.listDevLogs(session.token),
    convexAdminDiagnosticsRepository.getErrorRate(session.token, range),
    convexAdminDiagnosticsRepository.getSearchActivityChart(session.token, range),
    convexAdminDiagnosticsRepository.getErrorHealthChart(session.token, range),
    convexAdminDiagnosticsRepository.getChannelDistribution(session.token),
  ]);

  return {
    session,
    logs,
    errorRate,
    searchActivity,
    errorHealth,
    channelDistribution,
  };
}

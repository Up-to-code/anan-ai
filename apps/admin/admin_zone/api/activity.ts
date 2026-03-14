import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminActivityRepository } from "@/server/infrastructure/convex/adminActivityRepository";

/**
 * WHY:   The activity section splits one merged feed into several route-backed tabs.
 * WHAT:  Loads the requested source-filtered activity feed for the current admin.
 * HOW:   Maps the UI tab to the repository source filter and returns the latest entries.
 */
export async function getActivityPageData(tab: "all" | "notifications" | "messages" | "admin-log") {
  const session = await requireAdminPageSession("/activity");
  const source = tab === "admin-log" ? "admin" : tab;

  return {
    session,
    tab,
    rows: await convexAdminActivityRepository.list(session.token, source as "all" | "notifications" | "messages" | "admin"),
  };
}

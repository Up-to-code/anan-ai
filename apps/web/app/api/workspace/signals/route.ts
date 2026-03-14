import { getWorkspaceNotificationSummary } from "@/server/domains/notifications/service";
import { getInboxUnreadSummaryForCurrentUser } from "@/server/domains/inbox/service";
import { toErrorResponse } from "@/server/contracts/errors";

/**
 * WHY:   The workspace shell header needs a small aggregated signal endpoint instead of multiple concurrent client reads.
 * WHAT:  Returns unread notification and inbox counts for the current workspace user.
 * HOW:   Loads the notification summary and inbox list in parallel, derives unread totals, and normalizes failures.
 */
export async function GET() {
  try {
    const [notifications, inboxSummary] = await Promise.all([
      getWorkspaceNotificationSummary(),
      getInboxUnreadSummaryForCurrentUser(),
    ]);

    return Response.json({
      notificationCount: notifications.unreadCount,
      inboxCount: inboxSummary.unreadCount,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

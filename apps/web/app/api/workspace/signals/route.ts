import { getWorkspaceNotificationSummary } from "@/server/domains/notifications/service";
import { listInboxConversations } from "@/server/domains/inbox/service";
import { toErrorResponse } from "@/server/contracts/errors";

/**
 * WHY:   The workspace shell header needs a small aggregated signal endpoint instead of multiple concurrent client reads.
 * WHAT:  Returns unread notification and inbox counts for the current workspace user.
 * HOW:   Loads the notification summary and inbox list in parallel, derives unread totals, and normalizes failures.
 */
export async function GET() {
  try {
    const [notifications, conversations] = await Promise.all([
      getWorkspaceNotificationSummary(),
      listInboxConversations(),
    ]);

    return Response.json({
      notificationCount: notifications.unreadCount,
      inboxCount: conversations.reduce((sum, item) => sum + item.unreadCount, 0),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

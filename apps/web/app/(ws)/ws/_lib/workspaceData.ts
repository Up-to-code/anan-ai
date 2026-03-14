import { redirect } from "next/navigation";
import { DomainError, normalizeDomainError } from "@/server/contracts/errors";
import {
  getWorkspaceBehaviorForCurrentUser,
  getWorkspaceSidebarDataForCurrentUser,
} from "@/server/domains/workspaces/service";
import { listAnanProThreads } from "@/server/domains/ananPro/service";
import { getWorkspaceNotificationSummary } from "@/server/domains/notifications/service";
import { listInboxConversations } from "@/server/domains/inbox/service";

/**
 * WHY: Layout needs user + organizations for sidebar (org name, user/org block).
 * WHAT: Returns { user, organizations } without full profile. Redirects if unauthenticated.
 * HOW: Uses the gateway workspace service and redirects when the session layer reports UNAUTHORIZED.
 */
export async function getLayoutSidebarData(returnTo: string) {
  try {
    const [sidebar, notifications, conversations, assistantThreads] = await Promise.all([
      getWorkspaceSidebarDataForCurrentUser(),
      getWorkspaceNotificationSummary(),
      listInboxConversations(),
      listAnanProThreads(12),
    ]);

    return {
      ...sidebar,
      recentAssistantThreads: assistantThreads.slice(0, 3),
      allAssistantThreads: assistantThreads,
      signalCounts: {
        notificationCount: notifications.unreadCount,
        inboxCount: conversations.reduce((sum, item) => sum + item.unreadCount, 0),
      },
    };
  } catch (error) {
    const domainError = normalizeDomainError(error);
    if (domainError.code === "UNAUTHORIZED") {
      redirect(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
    }
    throw domainError;
  }
}

export async function requireWorkspaceData(returnTo: string) {
  try {
    return await getWorkspaceBehaviorForCurrentUser();
  } catch (error) {
    const domainError = normalizeDomainError(error);
    if (domainError.code === "UNAUTHORIZED") {
      redirect(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
    }
    throw new DomainError({
      code: domainError.code,
      message: domainError.message,
      status: domainError.status,
    });
  }
}

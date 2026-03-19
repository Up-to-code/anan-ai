import { redirect } from "next/navigation";
import { DomainError, normalizeDomainError } from "@/server/contracts/errors";
import {
  getWorkspaceBehaviorForCurrentUser,
  getWorkspaceSidebarDataForCurrentUser,
} from "@/server/domains/workspaces/service";
import { listAnanProThreads } from "@/server/domains/ananPro/service";
import { getWorkspaceNotificationSummary } from "@/server/domains/notifications/service";
import { getInboxUnreadSummaryForCurrentUser } from "@/server/domains/inbox/service";

function isNextRedirectError(error: unknown) {
  const digest = (error as { digest?: string } | null)?.digest;
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
    return true;
  }
  const message = error instanceof Error ? error.message : "";
  return message.includes("NEXT_REDIRECT");
}

function isRetryableUpstreamFailure(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("fetch failed") || normalized.includes("upstream") || normalized.includes("network");
}

/**
 * WHY: Layout needs user + organizations for sidebar (org name, user/org block).
 * WHAT: Returns { user, organizations } without full profile. Redirects if unauthenticated.
 * HOW: Uses the gateway workspace service and redirects when the session layer reports UNAUTHORIZED.
 */
export async function getLayoutSidebarData(returnTo: string) {
  try {
    // Resolve session/sidebar first so auth failures short-circuit before extra protected queries.
    const sidebar = await getWorkspaceSidebarDataForCurrentUser();
    const [notifications, inboxSummary, assistantThreads] = await Promise.all([
      getWorkspaceNotificationSummary(),
      getInboxUnreadSummaryForCurrentUser(),
      listAnanProThreads(12),
    ]);

    return {
      ...sidebar,
      recentAssistantThreads: assistantThreads.slice(0, 3),
      allAssistantThreads: assistantThreads,
      signalCounts: {
        notificationCount: notifications.unreadCount,
        inboxCount: inboxSummary.unreadCount,
      },
    };
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    const domainError = normalizeDomainError(error);
    if (domainError.code === "UNAUTHORIZED") {
      redirect(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
    }
    throw domainError;
  }
}

export async function requireWorkspaceData(returnTo: string) {
  try {
    const behavior = await getWorkspaceBehaviorForCurrentUser();
    if (behavior.onboarding.needsOrganization && returnTo !== "/ws") {
      redirect(`/ws?onboarding=required&returnTo=${encodeURIComponent(returnTo)}`);
    }
    return behavior;
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }
    const domainError = normalizeDomainError(error);
    if (domainError.code === "UNAUTHORIZED") {
      redirect(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
    }
    if (domainError.code === "INTERNAL_ERROR" && isRetryableUpstreamFailure(domainError.message)) {
      throw new DomainError({
        code: "UPSTREAM_UNAVAILABLE",
        message: "تعذر الاتصال بخدمات مساحة العمل حالياً. أعد المحاولة بعد لحظات.",
        status: 503,
      });
    }
    throw new DomainError({
      code: domainError.code,
      message: domainError.message,
      status: domainError.status,
    });
  }
}

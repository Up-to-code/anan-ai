import { beforeEach, describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((href: string) => {
    throw new Error(`NEXT_REDIRECT:${href}`);
  }),
}));

const { getWorkspaceBehaviorForCurrentUser, getWorkspaceSidebarDataForCurrentUser } = vi.hoisted(() => ({
  getWorkspaceBehaviorForCurrentUser: vi.fn(),
  getWorkspaceSidebarDataForCurrentUser: vi.fn(),
}));

const { listAnanProThreads } = vi.hoisted(() => ({
  listAnanProThreads: vi.fn(),
}));

const { getWorkspaceNotificationSummary } = vi.hoisted(() => ({
  getWorkspaceNotificationSummary: vi.fn(),
}));

const { getInboxUnreadSummaryForCurrentUser } = vi.hoisted(() => ({
  getInboxUnreadSummaryForCurrentUser: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/server/domains/auth/workspaces/service", () => ({
  getWorkspaceBehaviorForCurrentUser,
  getWorkspaceSidebarDataForCurrentUser,
}));

vi.mock("@/server/domains/workspace/ananPro/service", () => ({
  listAnanProThreads,
}));

vi.mock("@/server/domains/workspace/notifications/service", () => ({
  getWorkspaceNotificationSummary,
}));

vi.mock("@/server/domains/workspace/inbox/service", () => ({
  getInboxUnreadSummaryForCurrentUser,
}));

import { getLayoutSidebarData, requireWorkspaceData } from "./workspaceData";

beforeEach(() => {
  redirect.mockClear();
  getWorkspaceBehaviorForCurrentUser.mockReset();
  getWorkspaceSidebarDataForCurrentUser.mockReset();
  listAnanProThreads.mockReset();
  getWorkspaceNotificationSummary.mockReset();
  getInboxUnreadSummaryForCurrentUser.mockReset();
});

describe("workspaceData", () => {
  it("redirects inbox routes back to onboarding when a workspace org is still missing", async () => {
    getWorkspaceBehaviorForCurrentUser.mockResolvedValue({
      onboarding: { needsOrganization: true, suggestedOrganizationType: "broker" },
    });

    await expect(requireWorkspaceData("/ws/inbox")).rejects.toThrow(
      "NEXT_REDIRECT:/ws?onboarding=required&returnTo=%2Fws%2Finbox",
    );
  });

  it("redirects projects routes back to onboarding when a workspace org is still missing", async () => {
    getWorkspaceBehaviorForCurrentUser.mockResolvedValue({
      onboarding: { needsOrganization: true, suggestedOrganizationType: "broker" },
    });

    await expect(requireWorkspaceData("/ws/projects")).rejects.toThrow(
      "NEXT_REDIRECT:/ws?onboarding=required&returnTo=%2Fws%2Fprojects",
    );
  });

  it("redirects crm routes back to onboarding when a workspace org is still missing", async () => {
    getWorkspaceBehaviorForCurrentUser.mockResolvedValue({
      onboarding: { needsOrganization: true, suggestedOrganizationType: "broker" },
    });

    await expect(requireWorkspaceData("/ws/crm")).rejects.toThrow(
      "NEXT_REDIRECT:/ws?onboarding=required&returnTo=%2Fws%2Fcrm",
    );
  });

  it("redirects offer creation routes back to onboarding when a workspace org is still missing", async () => {
    getWorkspaceBehaviorForCurrentUser.mockResolvedValue({
      onboarding: { needsOrganization: true, suggestedOrganizationType: "broker" },
    });

    await expect(requireWorkspaceData("/ws/offers/create")).rejects.toThrow(
      "NEXT_REDIRECT:/ws?onboarding=required&returnTo=%2Fws%2Foffers%2Fcreate",
    );
  });

  it("returns workspace behavior for the root workspace route even while onboarding is required", async () => {
    getWorkspaceBehaviorForCurrentUser.mockResolvedValue({
      onboarding: { needsOrganization: true, suggestedOrganizationType: "broker" },
      audience: "broker",
    });

    await expect(requireWorkspaceData("/ws")).resolves.toMatchObject({
      audience: "broker",
    });
  });

  it("surfaces hydrated sidebar signals when organizations exist", async () => {
    getWorkspaceSidebarDataForCurrentUser.mockResolvedValue({
      user: { id: "user-1" },
      organizations: [{ id: "org-1" }],
    });
    getWorkspaceNotificationSummary.mockResolvedValue({
      unreadCount: 2,
      latest: [{ id: "notification-1", type: "message" }],
    });
    getInboxUnreadSummaryForCurrentUser.mockResolvedValue({ unreadCount: 4 });
    listAnanProThreads.mockResolvedValue([{ id: "thread-1" }, { id: "thread-2" }]);

    await expect(getLayoutSidebarData("/ws")).resolves.toMatchObject({
      signalCounts: {
        notificationCount: 2,
        inboxCount: 4,
      },
      recentAssistantThreads: [{ id: "thread-1" }, { id: "thread-2" }],
      initialNotifications: [{ id: "notification-1" }],
    });
  });

  it("redirects unauthenticated users to signin", async () => {
    getWorkspaceSidebarDataForCurrentUser.mockRejectedValue(
      new DomainError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
        status: 401,
      }),
    );

    await expect(getLayoutSidebarData("/ws")).rejects.toThrow(
      "NEXT_REDIRECT:/signin?returnTo=%2Fws",
    );
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { getAdminUserDetailPageData } = vi.hoisted(() => ({
  getAdminUserDetailPageData: vi.fn(),
}));

vi.mock("@/admin_zone/api/users", () => ({
  getAdminUserDetailPageData,
  updateAdminUser: vi.fn(),
}));

import UserDetailPage from "./index";

describe("UserDetailPage", () => {
  it("renders empty-state copy when related panels have no data", async () => {
    getAdminUserDetailPageData.mockResolvedValue({
      detail: {
        identity: {
          userKey: "auth__u-1",
          name: "Nada",
          email: "nada@example.com",
          channel: "web",
        },
        organizations: [],
        memberships: [],
        verificationRequests: [],
        messages: { assistantCount: 0, inboxCount: 0, latestAssistantMessages: [], latestInboxMessages: [] },
        activity: { knowledgeResearchCount: 0, searchLogsCount: 0, latestResearch: [], latestSearchLogs: [] },
      },
    });

    const element = await UserDetailPage({ userKey: "auth__u-1", tab: "verification" });
    const html = renderToStaticMarkup(element);

    expect(html).toContain("لا توجد طلبات تحقق");
  });

  it("renders offer and access metrics from the expanded detail payload", async () => {
    getAdminUserDetailPageData.mockResolvedValue({
      detail: {
        identity: {
          userKey: "auth__u-1",
          name: "Nada",
          email: "nada@example.com",
          channel: "web",
          role: "broker",
          roleStatus: "approved",
        },
        metrics: {
          organizationsCount: 1,
          dealsCount: 2,
        },
        offers: {
          summary: {
            sent: 3,
            received: 1,
            publicApplied: 1,
            pending: 2,
            accepted: 1,
            rejected: 1,
          },
          statusBreakdown: {
            pending: 2,
            accepted: 1,
            rejected: 1,
          },
          visibilityBreakdown: {
            public: 1,
            private: 3,
          },
          recent: [],
        },
        connections: {
          counterparts: [],
          recentHandoffs: [],
        },
        messages: {
          conversationCount: 0,
          unreadConversationCount: 0,
          assistantCount: 0,
          inboxCount: 0,
          conversations: [],
          latestAssistantMessages: [],
          latestInboxMessages: [],
        },
        notifications: { unreadCount: 0 },
        access: {
          role: "broker",
          roleStatus: "approved",
          showInOffersDirectory: true,
          verified: true,
          hasActiveSubscription: true,
          actionModeEnabled: true,
          mode: "action",
          subscription: { status: "active" },
        },
        organizations: [],
        memberships: [],
        verificationRequests: [],
        activity: { latestResearch: [], latestSearchLogs: [], latestNotifications: [], latestOrders: [], latestDeals: [] },
      },
    });

    const offersElement = await UserDetailPage({ userKey: "auth__u-1", tab: "offers" });
    const accessElement = await UserDetailPage({ userKey: "auth__u-1", tab: "access" });
    const offersHtml = renderToStaticMarkup(offersElement);
    const accessHtml = renderToStaticMarkup(accessElement);

    expect(offersHtml).toContain("أرسل");
    expect(offersHtml).toContain("عام مقبول");
    expect(accessHtml).toContain("Action Mode");
    expect(accessHtml).toContain("الوصول");
  });
});

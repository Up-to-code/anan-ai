import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

const { getOrganizationDetailPageData } = vi.hoisted(() => ({
  getOrganizationDetailPageData: vi.fn(),
}));

vi.mock("@/admin_zone/api/organizations", () => ({
  getOrganizationDetailPageData,
}));

import OrganizationDetailPage from "./index";

const organizationDetailFixture = {
  detail: {
    organization: {
      organizationKey: "red__org-1",
      name: "شركة الضوء",
      ownerType: "red",
      isVerified: true,
      status: "active",
    },
    metrics: {
      membersCount: 2,
      offersCount: 4,
      conversationsCount: 1,
      dealsCount: 1,
    },
    memberships: [],
    invites: [],
    properties: [],
    linkedProfiles: [],
    offers: {
      summary: {
        sent: 2,
        received: 2,
        pending: 1,
        accepted: 2,
        rejected: 1,
        public: 1,
        private: 3,
      },
      statusBreakdown: {
        pending: 1,
        accepted: 2,
        rejected: 1,
      },
      visibilityBreakdown: {
        public: 1,
        private: 3,
      },
      topCounterparts: [],
      recent: [],
    },
    messages: {
      conversationCount: 1,
      unreadConversationCount: 0,
      inboxCount: 3,
      conversations: [],
      latestInboxMessages: [],
    },
    subscription: {
      planTier: "pro",
      status: "active",
    },
    orders: { recent: [] },
    deals: { recent: [] },
    verificationRequests: [],
    access: {
      verified: true,
      hasActiveSubscription: true,
      actionModeEnabled: true,
      mode: "action",
      linkedProfilesVisibleInOffersDirectory: 2,
    },
  },
};

it("renders expanded offers and access views", async () => {
  getOrganizationDetailPageData.mockResolvedValue(organizationDetailFixture);

  const offersElement = await OrganizationDetailPage({ organizationKey: "red__org-1", tab: "offers" });
  const accessElement = await OrganizationDetailPage({ organizationKey: "red__org-1", tab: "access" });
  const offersHtml = renderToStaticMarkup(offersElement);
  const accessHtml = renderToStaticMarkup(accessElement);

  expect(offersHtml).toContain("مرسل");
  expect(offersHtml).toContain("أعلى الأطراف المقابلة");
  expect(accessHtml).toContain("النفاذ والاشتراك");
  expect(accessHtml).toContain("Action Mode");
});

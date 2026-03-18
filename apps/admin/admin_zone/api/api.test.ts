import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminPageSession } = vi.hoisted(() => ({
  requireAdminPageSession: vi.fn(),
}));

const { requireAdminSession } = vi.hoisted(() => ({
  requireAdminSession: vi.fn(),
}));

const { convexAdminActivityRepository } = vi.hoisted(() => ({
  convexAdminActivityRepository: { list: vi.fn() },
}));

const { convexAdminAnalyticsRepository } = vi.hoisted(() => ({
  convexAdminAnalyticsRepository: {
    getMessageAnalytics: vi.fn(),
    getActiveUsersAnalytics: vi.fn(),
    getBrokerAnalytics: vi.fn(),
    getDeveloperAnalytics: vi.fn(),
    getPropertyAnalytics: vi.fn(),
    getOfferAnalytics: vi.fn(),
    getConnectionAnalytics: vi.fn(),
  },
}));

const { convexAdminDiagnosticsRepository } = vi.hoisted(() => ({
  convexAdminDiagnosticsRepository: {
    listDevLogs: vi.fn(),
    getErrorRate: vi.fn(),
    getSearchActivityChart: vi.fn(),
    getErrorHealthChart: vi.fn(),
    getChannelDistribution: vi.fn(),
  },
}));

const { convexAdminKnowledgeRepository } = vi.hoisted(() => ({
  convexAdminKnowledgeRepository: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const { convexAdminOrdersRepository } = vi.hoisted(() => ({
  convexAdminOrdersRepository: {
    list: vi.fn(),
    update: vi.fn(),
  },
}));

const { convexAdminOrganizationsRepository } = vi.hoisted(() => ({
  convexAdminOrganizationsRepository: {
    listBrokers: vi.fn(),
    listDevelopers: vi.fn(),
    listMemberships: vi.fn(),
    listInvites: vi.fn(),
    getDetail: vi.fn(),
  },
}));

const { convexAdminOverviewRepository } = vi.hoisted(() => ({
  convexAdminOverviewRepository: {
    getStats: vi.fn(),
    listRecentActivities: vi.fn(),
  },
}));

const { convexAdminPropertiesRepository } = vi.hoisted(() => ({
  convexAdminPropertiesRepository: {
    list: vi.fn(),
    listReds: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const { convexAdminUsersRepository } = vi.hoisted(() => ({
  convexAdminUsersRepository: {
    listAdminProfiles: vi.fn(),
    listAdminMemberships: vi.fn(),
    listAdminUserVerification: vi.fn(),
    listAdminUsers: vi.fn(),
    getDetail: vi.fn(),
    update: vi.fn(),
  },
}));

const { convexAdminVerificationsRepository } = vi.hoisted(() => ({
  convexAdminVerificationsRepository: {
    getSummary: vi.fn(),
    list: vi.fn(),
    getDetail: vi.fn(),
    review: vi.fn(),
  },
}));

vi.mock("@/lib/serverSession", () => ({
  requireAdminPageSession,
}));

vi.mock("@/server/auth/guards", () => ({
  requireAdminSession,
}));

vi.mock("@/server/infrastructure/convex/adminActivityRepository", () => ({
  convexAdminActivityRepository,
}));

vi.mock("@/server/infrastructure/convex/adminAnalyticsRepository", () => ({
  convexAdminAnalyticsRepository,
}));

vi.mock("@/server/infrastructure/convex/adminDiagnosticsRepository", () => ({
  convexAdminDiagnosticsRepository,
}));

vi.mock("@/server/infrastructure/convex/adminKnowledgeRepository", () => ({
  convexAdminKnowledgeRepository,
}));

vi.mock("@/server/infrastructure/convex/adminOrdersRepository", () => ({
  convexAdminOrdersRepository,
}));

vi.mock("@/server/infrastructure/convex/adminOrganizationsRepository", () => ({
  convexAdminOrganizationsRepository,
}));

vi.mock("@/server/infrastructure/convex/adminOverviewRepository", () => ({
  convexAdminOverviewRepository,
}));

vi.mock("@/server/infrastructure/convex/adminPropertiesRepository", () => ({
  convexAdminPropertiesRepository,
}));

vi.mock("@/server/infrastructure/convex/adminUsersRepository", () => ({
  convexAdminUsersRepository,
}));

vi.mock("@/server/infrastructure/convex/adminVerificationsRepository", () => ({
  convexAdminVerificationsRepository,
}));

import { getActivityPageData } from "./activity";
import { getAnalyticsPageData } from "./analytics";
import { getAdminDiagnosticsPageData } from "./diagnostics";
import { createAdminKnowledgePage, getAdminKnowledgePageData } from "./knowledge";
import { getAdminOrdersPageData, updateAdminOrder } from "./orders";
import { getOrganizationDetailPageData, getOrganizationsPageData } from "./organizations";
import { getDashboardOverviewPageData } from "./overview";
import { createAdminProperty, getAdminPropertiesPageData } from "./properties";
import { getAdminUserDetailPageData, getAdminUsersPageData, updateAdminUser } from "./users";
import { getVerificationDetailPageData, getVerificationsPageData, reviewVerificationRequest } from "./verifications";

describe("admin API loaders and actions", () => {
  beforeEach(() => {
    requireAdminPageSession.mockReset();
    requireAdminSession.mockReset();
    requireAdminPageSession.mockResolvedValue({
      token: "admin-token",
      context: { userId: "admin-1", role: "admin" },
    });
    requireAdminSession.mockResolvedValue({
      token: "admin-token",
      context: { userId: "admin-1", role: "admin" },
    });

    convexAdminActivityRepository.list.mockReset();
    convexAdminAnalyticsRepository.getMessageAnalytics.mockReset();
    convexAdminAnalyticsRepository.getActiveUsersAnalytics.mockReset();
    convexAdminAnalyticsRepository.getBrokerAnalytics.mockReset();
    convexAdminAnalyticsRepository.getDeveloperAnalytics.mockReset();
    convexAdminAnalyticsRepository.getPropertyAnalytics.mockReset();
    convexAdminAnalyticsRepository.getOfferAnalytics.mockReset();
    convexAdminAnalyticsRepository.getConnectionAnalytics.mockReset();
    convexAdminDiagnosticsRepository.listDevLogs.mockReset();
    convexAdminDiagnosticsRepository.getErrorRate.mockReset();
    convexAdminDiagnosticsRepository.getSearchActivityChart.mockReset();
    convexAdminDiagnosticsRepository.getErrorHealthChart.mockReset();
    convexAdminDiagnosticsRepository.getChannelDistribution.mockReset();
    convexAdminKnowledgeRepository.list.mockReset();
    convexAdminKnowledgeRepository.get.mockReset();
    convexAdminKnowledgeRepository.create.mockReset();
    convexAdminOrdersRepository.list.mockReset();
    convexAdminOrdersRepository.update.mockReset();
    convexAdminOrganizationsRepository.listBrokers.mockReset();
    convexAdminOrganizationsRepository.listDevelopers.mockReset();
    convexAdminOrganizationsRepository.listMemberships.mockReset();
    convexAdminOrganizationsRepository.listInvites.mockReset();
    convexAdminOrganizationsRepository.getDetail.mockReset();
    convexAdminOverviewRepository.getStats.mockReset();
    convexAdminOverviewRepository.listRecentActivities.mockReset();
    convexAdminPropertiesRepository.list.mockReset();
    convexAdminPropertiesRepository.listReds.mockReset();
    convexAdminPropertiesRepository.get.mockReset();
    convexAdminPropertiesRepository.create.mockReset();
    convexAdminUsersRepository.listAdminProfiles.mockReset();
    convexAdminUsersRepository.listAdminMemberships.mockReset();
    convexAdminUsersRepository.listAdminUserVerification.mockReset();
    convexAdminUsersRepository.listAdminUsers.mockReset();
    convexAdminUsersRepository.getDetail.mockReset();
    convexAdminUsersRepository.update.mockReset();
    convexAdminVerificationsRepository.getSummary.mockReset();
    convexAdminVerificationsRepository.list.mockReset();
    convexAdminVerificationsRepository.getDetail.mockReset();
    convexAdminVerificationsRepository.review.mockReset();
  });

  it("loads activity data with the mapped admin-log source", async () => {
    convexAdminActivityRepository.list.mockResolvedValue([{ id: "row-1" }]);

    const result = await getActivityPageData("admin-log");

    expect(requireAdminPageSession).toHaveBeenCalledWith("/activity");
    expect(convexAdminActivityRepository.list).toHaveBeenCalledWith("admin-token", "admin");
    expect(result.rows).toEqual([{ id: "row-1" }]);
  });

  it("loads the requested analytics tab dataset", async () => {
    convexAdminAnalyticsRepository.getDeveloperAnalytics.mockResolvedValue({ total: 3 });

    const result = await getAnalyticsPageData("developers");

    expect(requireAdminPageSession).toHaveBeenCalledWith("/analytics/developers");
    expect(convexAdminAnalyticsRepository.getDeveloperAnalytics).toHaveBeenCalledWith("admin-token");
    expect(result.data).toEqual({ total: 3 });
  });

  it("loads the offers analytics dataset", async () => {
    convexAdminAnalyticsRepository.getOfferAnalytics.mockResolvedValue({ summary: { total: 9 } });

    const result = await getAnalyticsPageData("offers");

    expect(requireAdminPageSession).toHaveBeenCalledWith("/analytics/offers");
    expect(convexAdminAnalyticsRepository.getOfferAnalytics).toHaveBeenCalledWith("admin-token");
    expect(result.data).toEqual({ summary: { total: 9 } });
  });

  it("loads the connections analytics dataset", async () => {
    convexAdminAnalyticsRepository.getConnectionAnalytics.mockResolvedValue({ summary: { totalPairs: 4 } });

    const result = await getAnalyticsPageData("connections");

    expect(requireAdminPageSession).toHaveBeenCalledWith("/analytics/connections");
    expect(convexAdminAnalyticsRepository.getConnectionAnalytics).toHaveBeenCalledWith("admin-token");
    expect(result.data).toEqual({ summary: { totalPairs: 4 } });
  });

  it("loads diagnostics datasets in parallel", async () => {
    convexAdminDiagnosticsRepository.listDevLogs.mockResolvedValue([]);
    convexAdminDiagnosticsRepository.getErrorRate.mockResolvedValue([]);
    convexAdminDiagnosticsRepository.getSearchActivityChart.mockResolvedValue([]);
    convexAdminDiagnosticsRepository.getErrorHealthChart.mockResolvedValue([]);
    convexAdminDiagnosticsRepository.getChannelDistribution.mockResolvedValue([]);

    const result = await getAdminDiagnosticsPageData("month");

    expect(requireAdminPageSession).toHaveBeenCalledWith("/diagnostics");
    expect(convexAdminDiagnosticsRepository.getErrorRate).toHaveBeenCalledWith("admin-token", "month");
    expect(result.logs).toEqual([]);
  });

  it("loads knowledge list plus selected page", async () => {
    convexAdminKnowledgeRepository.list.mockResolvedValue([{ id: "page-1" }]);
    convexAdminKnowledgeRepository.get.mockResolvedValue({ id: "page-2" });

    const result = await getAdminKnowledgePageData("page-2");

    expect(convexAdminKnowledgeRepository.list).toHaveBeenCalledWith("admin-token");
    expect(convexAdminKnowledgeRepository.get).toHaveBeenCalledWith("admin-token", "page-2");
    expect(result.selectedPage).toEqual({ id: "page-2" });
  });

  it("creates knowledge through the admin session boundary", async () => {
    await createAdminKnowledgePage({ slug: "faq", title: "FAQ", content: "..." });

    expect(requireAdminSession).toHaveBeenCalled();
    expect(convexAdminKnowledgeRepository.create).toHaveBeenCalledWith("admin-token", {
      slug: "faq",
      title: "FAQ",
      content: "...",
    });
  });

  it("loads orders and forwards updates", async () => {
    convexAdminOrdersRepository.list.mockResolvedValue([{ id: "order-1" }]);

    const result = await getAdminOrdersPageData({ status: "new_lead" });
    await updateAdminOrder({ id: "order-1", notes: "Assigned" });

    expect(result.orders).toEqual([{ id: "order-1" }]);
    expect(convexAdminOrdersRepository.update).toHaveBeenCalledWith("admin-token", {
      id: "order-1",
      notes: "Assigned",
    });
  });

  it("loads organization invites and detail routes", async () => {
    convexAdminOrganizationsRepository.listInvites.mockResolvedValue([{ id: "invite-1" }]);
    convexAdminOrganizationsRepository.getDetail.mockResolvedValue({ id: "org-1" });

    const list = await getOrganizationsPageData("invites");
    const detail = await getOrganizationDetailPageData("broker/acme");

    expect(convexAdminOrganizationsRepository.listInvites).toHaveBeenCalledWith("admin-token");
    expect(requireAdminPageSession).toHaveBeenCalledWith("/organizations/broker%2Facme");
    expect(detail.detail).toEqual({ id: "org-1" });
    expect(list.rows).toEqual([{ id: "invite-1" }]);
  });

  it("loads dashboard overview stats and recent activity", async () => {
    convexAdminOverviewRepository.getStats.mockResolvedValue({ totalUsers: 10 });
    convexAdminOverviewRepository.listRecentActivities.mockResolvedValue([{ id: "activity-1" }]);

    const result = await getDashboardOverviewPageData();

    expect(result.stats).toEqual({ totalUsers: 10 });
    expect(result.recentActivities).toEqual([{ id: "activity-1" }]);
  });

  it("loads admin properties and forwards property creation", async () => {
    convexAdminPropertiesRepository.list.mockResolvedValue({ page: [{ id: "property-1" }] });
    convexAdminPropertiesRepository.listReds.mockResolvedValue([{ id: "red-1" }]);
    convexAdminPropertiesRepository.get.mockResolvedValue({ id: "property-2" });

    const result = await getAdminPropertiesPageData({ selectedId: "property-2", status: "available" });
    await createAdminProperty({
      title: "Tower",
      address: "Riyadh",
      price: 1200000,
      beds: 3,
      baths: 3,
      description: "Prime inventory",
      REDId: "red-1",
    });

    expect(result.selectedProperty).toEqual({ id: "property-2" });
    expect(convexAdminPropertiesRepository.create).toHaveBeenCalledWith("admin-token", {
      title: "Tower",
      address: "Riyadh",
      price: 1200000,
      beds: 3,
      baths: 3,
      description: "Prime inventory",
      REDId: "red-1",
    });
  });

  it("loads user tabs, detail screens, and updates", async () => {
    convexAdminUsersRepository.listAdminMemberships.mockResolvedValue({ page: [{ id: "membership-1" }] });
    convexAdminUsersRepository.getDetail.mockResolvedValue({ id: "user-1" });

    const list = await getAdminUsersPageData({ tab: "memberships" });
    const detail = await getAdminUserDetailPageData("user/1");
    await updateAdminUser({ userId: "user-1", displayName: "Ahmed" });

    expect(convexAdminUsersRepository.listAdminMemberships).toHaveBeenCalledWith("admin-token", {
      paginationOpts: { numItems: 20, cursor: null },
    });
    expect(detail.detail).toEqual({ id: "user-1" });
    expect(convexAdminUsersRepository.update).toHaveBeenCalledWith("admin-token", {
      userId: "user-1",
      displayName: "Ahmed",
    });
    expect(list.tab).toBe("memberships");
  });

  it("loads verifications and forwards reviews with reviewer context", async () => {
    convexAdminVerificationsRepository.getSummary.mockResolvedValue({ total: 1 });
    convexAdminVerificationsRepository.list.mockResolvedValue([{ id: "request-1" }]);
    convexAdminVerificationsRepository.getDetail.mockResolvedValue({ id: "request-1" });

    const list = await getVerificationsPageData("new");
    const detail = await getVerificationDetailPageData("request-1");
    await reviewVerificationRequest({ id: "request-1", status: "approved" });

    expect(list.summary).toEqual({ total: 1 });
    expect(detail.detail).toEqual({ id: "request-1" });
    expect(convexAdminVerificationsRepository.review).toHaveBeenCalledWith("admin-token", {
      id: "request-1",
      status: "approved",
      reviewerId: "admin-1",
    });
  });
});

import { beforeEach, expect, it } from "vitest";

import {
  convexAdminActivityRepository,
  convexAdminAnalyticsRepository,
  convexAdminCommandCenterRepository,
  convexAdminDiagnosticsRepository,
  convexAdminKnowledgeRepository,
  convexAdminOrdersRepository,
  convexAdminOrganizationsRepository,
  convexAdminOverviewRepository,
  convexAdminPropertiesRepository,
  convexAdminUsersRepository,
  convexAdminVerificationsRepository,
  requireAdminSession,
  requireAdminPageSession,
  resetAdminApiMocks,
} from "./api.test.shared";

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

beforeEach(() => {
  resetAdminApiMocks();
});

it("loads activity data with the mapped admin-log source", async () => {
  convexAdminActivityRepository.list.mockResolvedValue([{ id: "row-1" }]);

  const result = await getActivityPageData("admin-log");

  expect(requireAdminPageSession).toHaveBeenCalledWith("/activity");
  expect(convexAdminActivityRepository.list).toHaveBeenCalledWith("admin-token", "admin");
  expect(result.rows).toEqual([{ id: "row-1" }]);
});

it("loads the executive analytics dataset", async () => {
  convexAdminCommandCenterRepository.getOverview.mockResolvedValue({ range: "90d", kpis: {} });
  convexAdminCommandCenterRepository.getCommercialAnalytics.mockResolvedValue({ range: "90d", summary: {} });
  convexAdminCommandCenterRepository.getPartnerHealthAnalytics.mockResolvedValue({ range: "90d", summary: {} });
  convexAdminCommandCenterRepository.getQueueHealthAnalytics.mockResolvedValue({ range: "90d", summary: {} });

  const result = await getAnalyticsPageData("executive");

  expect(requireAdminPageSession).toHaveBeenCalledWith("/analytics/executive");
  expect(convexAdminCommandCenterRepository.getOverview).toHaveBeenCalledWith("admin-token", "90d");
  expect(convexAdminCommandCenterRepository.getCommercialAnalytics).toHaveBeenCalledWith("admin-token", "90d");
  expect(convexAdminCommandCenterRepository.getPartnerHealthAnalytics).toHaveBeenCalledWith("admin-token", "90d");
  expect(convexAdminCommandCenterRepository.getQueueHealthAnalytics).toHaveBeenCalledWith("admin-token", "90d");
  expect(result.data).toEqual({
    overview: { range: "90d", kpis: {} },
    commercial: { range: "90d", summary: {} },
    partners: { range: "90d", summary: {} },
    queue: { range: "90d", summary: {} },
  });
});

it("loads the commercial analytics dataset", async () => {
  convexAdminCommandCenterRepository.getCommercialAnalytics.mockResolvedValue({ range: "30d", summary: { total: 9 } });

  const result = await getAnalyticsPageData("commercial", "30d");

  expect(requireAdminPageSession).toHaveBeenCalledWith("/analytics/commercial");
  expect(convexAdminCommandCenterRepository.getCommercialAnalytics).toHaveBeenCalledWith("admin-token", "30d");
  expect(result.data).toEqual({ range: "30d", summary: { total: 9 } });
});

it("loads the collaboration analytics dataset", async () => {
  convexAdminAnalyticsRepository.getConnectionAnalytics.mockResolvedValue({ summary: { totalPairs: 4 } });
  convexAdminCommandCenterRepository.getQueueHealthAnalytics.mockResolvedValue({ range: "30d", summary: { unassignedOrders: 2 } });

  const result = await getAnalyticsPageData("collaboration", "30d");

  expect(requireAdminPageSession).toHaveBeenCalledWith("/analytics/collaboration");
  expect(convexAdminAnalyticsRepository.getConnectionAnalytics).toHaveBeenCalledWith("admin-token");
  expect(convexAdminCommandCenterRepository.getQueueHealthAnalytics).toHaveBeenCalledWith("admin-token", "30d");
  expect(result.data).toEqual({
    connections: { summary: { totalPairs: 4 } },
    queue: { range: "30d", summary: { unassignedOrders: 2 } },
  });
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
  convexAdminCommandCenterRepository.getOverview.mockResolvedValue({ range: "90d", kpis: { activeUsers: 10 } });

  const result = await getDashboardOverviewPageData();

  expect(result.stats).toEqual({ totalUsers: 10 });
  expect(result.recentActivities).toEqual([{ id: "activity-1" }]);
  expect(result.commandCenter).toEqual({ range: "90d", kpis: { activeUsers: 10 } });
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

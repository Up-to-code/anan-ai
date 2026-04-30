import { createRepositoryRefs, queryRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type OverviewApiRefs = {
  overviewStats: unknown;
};

type ActivitiesApiRefs = {
  listActivityFeed: unknown;
};

const overviewApi = createRepositoryRefs<OverviewApiRefs>(apiUnsafe, "admin_zone/overview");
const activitiesApi = createRepositoryRefs<ActivitiesApiRefs>(apiUnsafe, "admin_zone/activities");

export type OverviewStats = {
  users: number;
  brokers: number;
  developers: number;
  properties: number;
  offers: number;
  pendingOffers: number;
  conversations: number;
  directMessages: number;
  deals: number;
  activeSubscriptions: number;
  actionEnabledOrganizations: number;
  pendingVerificationRequests: number;
  inReviewVerificationRequests: number;
  approvedVerificationRequests: number;
  rejectedVerificationRequests: number;
  activeUsersLast30Days: number;
  recentActivityLast7Days: number;
};

/**
 * WHY:   The admin dashboard needs one repository surface for overview widgets and operational feeds.
 * WHAT:  Exposes auth-scoped readers for stats, charts, notifications, and recent activities.
 * HOW:   Delegates to the existing `convex/admin_zone/*` queries and returns stable DTOs.
 */
export const convexAdminOverviewRepository = {
  async getStats(token: string) {
    return queryRef<OverviewStats>(token, overviewApi.overviewStats);
  },
  async listRecentActivities(token: string, limit = 8) {
    return queryRef<Array<Record<string, unknown>>>(token, activitiesApi.listActivityFeed, { source: "all", limit });
  },
};

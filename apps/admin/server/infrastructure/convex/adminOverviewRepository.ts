import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type OverviewApiRefs = {
  overviewStats: unknown;
};

type ActivitiesApiRefs = {
  listActivityFeed: unknown;
};

const overviewApi = apiUnsafe["admin_zone/overview"] as OverviewApiRefs;
const activitiesApi = apiUnsafe["admin_zone/activities"] as ActivitiesApiRefs;

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
    return fetchQuery(overviewApi.overviewStats as never, {} as never, { token }) as Promise<OverviewStats>;
  },
  async listRecentActivities(token: string, limit = 8) {
    return fetchQuery(activitiesApi.listActivityFeed as never, { source: "all", limit } as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
};

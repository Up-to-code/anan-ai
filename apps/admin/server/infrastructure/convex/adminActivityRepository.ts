import { createRepositoryRefs, queryRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type ActivitiesApiRefs = {
  listActivityFeed: unknown;
};

const activitiesApi = createRepositoryRefs<ActivitiesApiRefs>(apiUnsafe, "admin_zone/activities");

/**
 * WHY:   The activity workspace needs one repository boundary for merged operational feeds.
 * WHAT:  Exposes activity reads filtered by source across notifications, messages, and admin actions.
 * HOW:   Calls the `admin_zone/activities.listActivityFeed` query using the current admin token.
 */
export const convexAdminActivityRepository = {
  async list(token: string, source: "all" | "notifications" | "messages" | "admin" = "all", limit = 60) {
    return queryRef<Array<Record<string, unknown>>>(token, activitiesApi.listActivityFeed, { source, limit });
  },
};

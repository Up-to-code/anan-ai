import { fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type ActivitiesApiRefs = {
  listActivityFeed: unknown;
};

const activitiesApi = apiUnsafe["admin_zone/activities"] as ActivitiesApiRefs;

/**
 * WHY:   The activity workspace needs one repository boundary for merged operational feeds.
 * WHAT:  Exposes activity reads filtered by source across notifications, messages, and admin actions.
 * HOW:   Calls the `admin_zone/activities.listActivityFeed` query using the current admin token.
 */
export const convexAdminActivityRepository = {
  async list(token: string, source: "all" | "notifications" | "messages" | "admin" = "all", limit = 60) {
    return fetchQuery(activitiesApi.listActivityFeed as never, { source, limit } as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
};

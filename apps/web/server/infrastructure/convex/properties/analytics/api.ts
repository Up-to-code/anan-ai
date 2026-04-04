import { apiUnsafe } from "@/lib/convexApi";

export type ProjectAnalyticsApiRefs = {
  getProjectAnalytics: unknown;
  recordProjectAnalyticsEvent: unknown;
};

export const projectAnalyticsApi = apiUnsafe["shared_logic/projectAnalytics"] as ProjectAnalyticsApiRefs;

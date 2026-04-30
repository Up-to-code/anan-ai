import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type ProjectAnalyticsApiRefs = {
  getProjectAnalytics: unknown;
  recordProjectAnalyticsEvent: unknown;
};

export const projectAnalyticsApi = createRepositoryRefs<ProjectAnalyticsApiRefs>(apiUnsafe, "shared_logic/projectAnalytics");

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { projectAnalyticsApi } from "./api";
import type { ProjectAnalyticsRepository } from "./types";

export type { ProjectAnalyticsRepository } from "./types";

/**
 * WHY:   Workspace property surfaces should read and write project analytics without embedding Convex transport details.
 * WHAT:  Repository adapter for owner analytics reads and viewer-safe analytics event tracking.
 * HOW:   Calls the shared Convex analytics query and mutation, then returns the stable web contract shapes.
 */
export const convexProjectAnalyticsRepository: ProjectAnalyticsRepository = {
  async getProjectAnalytics(token, propertyId) {
    return fetchQuery(
      projectAnalyticsApi.getProjectAnalytics as never,
      { propertyId: propertyId as never } as never,
      { token },
    ) as ReturnType<ProjectAnalyticsRepository["getProjectAnalytics"]>;
  },

  async recordProjectAnalyticsEvent(token, input) {
    return fetchMutation(
      projectAnalyticsApi.recordProjectAnalyticsEvent as never,
      {
        propertyId: input.id as never,
        eventType: input.eventType,
        source: input.source,
        conversationId: input.conversationId as never,
        offerCaseId: input.offerCaseId as never,
        dealId: input.dealId as never,
        metadata: input.metadata,
      } as never,
      { token },
    ) as ReturnType<ProjectAnalyticsRepository["recordProjectAnalyticsEvent"]>;
  },
};

import { mutationRef, queryRef } from "@anan/convex-adapters/repository";
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
    return queryRef<Awaited<ReturnType<ProjectAnalyticsRepository["getProjectAnalytics"]>>>(
      token,
      projectAnalyticsApi.getProjectAnalytics,
      { propertyId },
    );
  },

  async recordProjectAnalyticsEvent(token, input) {
    return mutationRef<Awaited<ReturnType<ProjectAnalyticsRepository["recordProjectAnalyticsEvent"]>>>(
      token,
      projectAnalyticsApi.recordProjectAnalyticsEvent,
      {
        propertyId: input.id,
        eventType: input.eventType,
        source: input.source,
        conversationId: input.conversationId,
        offerCaseId: input.offerCaseId,
        dealId: input.dealId,
        metadata: input.metadata,
      },
    );
  },
};

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type {
  TrackProjectAnalyticsEventInput,
  WorkspaceProjectAnalytics,
} from "@/server/contracts/properties";

type ProjectAnalyticsApiRefs = {
  getProjectAnalytics: unknown;
  recordProjectAnalyticsEvent: unknown;
};

const projectAnalyticsApi = apiUnsafe["shared_logic/projectAnalytics"] as ProjectAnalyticsApiRefs;

export type ProjectAnalyticsRepository = {
  getProjectAnalytics(token: string, propertyId: string): Promise<WorkspaceProjectAnalytics>;
  recordProjectAnalyticsEvent(
    token: string,
    input: TrackProjectAnalyticsEventInput,
  ): Promise<{ ok: true }>;
};

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
    ) as Promise<WorkspaceProjectAnalytics>;
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
    ) as Promise<{ ok: true }>;
  },
};

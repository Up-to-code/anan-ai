import type {
  TrackProjectAnalyticsEventInput,
  WorkspaceProjectAnalytics,
} from "@/server/contracts/properties";

export type ProjectAnalyticsRepository = {
  getProjectAnalytics(token: string, propertyId: string): Promise<WorkspaceProjectAnalytics>;
  recordProjectAnalyticsEvent(
    token: string,
    input: TrackProjectAnalyticsEventInput,
  ): Promise<{ ok: true }>;
};

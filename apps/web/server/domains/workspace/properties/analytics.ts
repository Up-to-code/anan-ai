import { type ResolvedSession } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import {
  trackProjectAnalyticsEventInputSchema,
  type TrackProjectAnalyticsEventInput,
  type WorkspaceProjectAnalytics,
} from "@/server/contracts/properties";
import {
  convexProjectAnalyticsRepository,
  type ProjectAnalyticsRepository,
} from "@/server/infrastructure/convex/properties/analytics";

type WorkspaceProjectAnalyticsDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  repository: ProjectAnalyticsRepository;
};

const defaultDependencies: WorkspaceProjectAnalyticsDependencies = {
  requireSession: async () => {
    throw new DomainError({
      code: "UNAUTHORIZED",
      message: "Workspace session is required",
      status: 401,
    });
  },
  repository: convexProjectAnalyticsRepository,
};

/**
 * WHY:   Workspace project analytics should be available through the same server-layer contract regardless of broker or developer ownership.
 * WHAT:  Loads the owner-only analytics projection for a single project.
 * HOW:   Resolves the current workspace session token, then delegates to the shared analytics repository query.
 */
export async function getWorkspaceProjectAnalytics(
  input: { id: string },
  dependencies: WorkspaceProjectAnalyticsDependencies = defaultDependencies,
): Promise<WorkspaceProjectAnalytics> {
  if (!input.id?.trim()) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: "Project id is required",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();
  return dependencies.repository.getProjectAnalytics(session.token, input.id);
}

/**
 * WHY:   Workspace project surfaces need one validated path for writing analytics events from buttons, links, and page views.
 * WHAT:  Records a project analytics event for the current session.
 * HOW:   Validates the event payload, resolves the session token, and forwards the write to the shared analytics repository mutation.
 */
export async function recordWorkspaceProjectAnalyticsEvent(
  input: TrackProjectAnalyticsEventInput,
  dependencies: WorkspaceProjectAnalyticsDependencies = defaultDependencies,
): Promise<{ ok: true }> {
  const parsed = trackProjectAnalyticsEventInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid project analytics event",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();
  return dependencies.repository.recordProjectAnalyticsEvent(session.token, parsed.data);
}

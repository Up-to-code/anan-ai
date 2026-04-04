import { requireSessionContext } from "@/server/auth/session";
import type { PropertyDetail } from "@/server/contracts/properties";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { convexInboxRepository, type InboxRepository } from "@/server/infrastructure/convex/messaging/inbox";
import {
  convexProjectAccessRepository,
  type ProjectAccessRepository,
} from "@/server/infrastructure/convex/properties/access";
import {
  convexSharedProjectDetailsRepository,
  type SharedProjectDetailsRepository,
} from "@/server/infrastructure/convex/properties/sharedDetails";
import { getWorkspacePropertyZone } from "@/server/ws/zones";

export type WorkspaceProjectDetailAccessMode = "owner" | "shared";

export type ResolvedWorkspaceProjectDetail = {
  property: PropertyDetail;
  accessMode: WorkspaceProjectDetailAccessMode;
  canEdit: boolean;
};

type WorkspaceProjectDetailResolverDependencies = {
  requireSession: typeof requireSessionContext;
  inboxRepository: Pick<InboxRepository, "hasProjectShareAccess">;
  projectAccessRepository: Pick<
    ProjectAccessRepository,
    "hasExplicitProjectViewerAccess" | "promoteCurrentUserToProjectViewer"
  >;
  rawPropertyRepository: Pick<SharedProjectDetailsRepository, "getProperty">;
};

const defaultDependencies: WorkspaceProjectDetailResolverDependencies = {
  requireSession: requireSessionContext,
  inboxRepository: convexInboxRepository,
  projectAccessRepository: convexProjectAccessRepository,
  rawPropertyRepository: convexSharedProjectDetailsRepository,
};

/**
 * WHY:   Workspace project URLs must support both owner-managed properties and projects explicitly shared through inbox collaboration.
 * WHAT:  Resolves one property detail plus the caller's access mode for `/ws/projects/[projectId]`.
 * HOW:   Tries the normal owner-scoped property zone first, then falls back to inbox-backed read-only access when a matching `project_share` exists.
 */
export async function resolveWorkspaceProjectDetail(
  input: {
    projectId: string;
    audience: WorkspaceAudience;
    ownerContext: WorkspaceOwnerContext;
  },
  dependencies: WorkspaceProjectDetailResolverDependencies = defaultDependencies,
): Promise<ResolvedWorkspaceProjectDetail | null> {
  if (input.audience !== "broker" && input.audience !== "developer") {
    return null;
  }

  const ownerProperty = await getWorkspacePropertyZone(input.audience, input.ownerContext)
    .getProperty({ id: input.projectId })
    .catch(() => null);

  if (ownerProperty) {
    return {
      property: ownerProperty,
      accessMode: "owner",
      canEdit: true,
    };
  }

  const session = await dependencies.requireSession();
  const hasExplicitViewerAccess = await dependencies.projectAccessRepository.hasExplicitProjectViewerAccess(
    session.token,
    input.projectId,
  );

  if (hasExplicitViewerAccess) {
    const sharedProperty = await dependencies.rawPropertyRepository.getProperty(session.token, input.projectId);
    if (!sharedProperty) {
      return null;
    }
    return {
      property: sharedProperty,
      accessMode: "shared",
      canEdit: false,
    };
  }

  const hasSharedAccess = await dependencies.inboxRepository.hasProjectShareAccess(
    session.token,
    input.projectId,
  );

  if (!hasSharedAccess) {
    return null;
  }

  const sharedProperty = await dependencies.rawPropertyRepository.getProperty(session.token, input.projectId);
  if (!sharedProperty) {
    return null;
  }

  await dependencies.projectAccessRepository.promoteCurrentUserToProjectViewer(session.token, {
    propertyId: input.projectId,
  });

  return {
    property: sharedProperty,
    accessMode: "shared",
    canEdit: false,
  };
}

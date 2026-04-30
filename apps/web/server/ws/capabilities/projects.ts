import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { buildWorkspaceProjectService } from "@/server/domains/workspace/projects/service";
import {
  convexBrokerProjectRepository,
  convexRedProjectRepository,
} from "@/server/infrastructure/convex/projects";
import { createUnavailableZoneError } from "../shared/errors";
import { buildWorkspaceScopedSessionResolver } from "../session";

/**
 * WHY:   Project dossier operations are now distinct from legacy property projection operations.
 * WHAT:  Returns the audience-aware Saudi project capability for broker/developer workspaces.
 * HOW:   Dispatches to the project-domain service and keeps `getWorkspacePropertyZone` focused on compatibility reads.
 */
export function getWorkspaceProjectZone(
  audience: WorkspaceAudience,
  ownerContext?: WorkspaceOwnerContext | null,
) {
  const requireSession = buildWorkspaceScopedSessionResolver(audience, ownerContext);

  if (audience === "broker") {
    return buildWorkspaceProjectService(audience, {
      audience,
      requireSession,
      repository: convexBrokerProjectRepository,
    });
  }

  if (audience === "developer") {
    return buildWorkspaceProjectService(audience, {
      audience,
      requireSession,
      repository: convexRedProjectRepository,
    });
  }

  throw createUnavailableZoneError("Projects");
}

import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";
import { buildWorkspaceProjectService } from "@/server/domains/workspace/projects/service";
import { createUnavailableZoneError } from "../shared/errors";

/**
 * WHY:   Project dossier operations are now distinct from legacy property projection operations.
 * WHAT:  Returns the audience-aware Saudi project capability for broker/developer workspaces.
 * HOW:   Dispatches to the project-domain service and keeps `getWorkspacePropertyZone` focused on compatibility reads.
 */
export function getWorkspaceProjectZone(
  audience: WorkspaceAudience,
  _ownerContext?: WorkspaceOwnerContext | null,
) {
  if (audience === "broker" || audience === "developer") {
    return buildWorkspaceProjectService(audience);
  }
  throw createUnavailableZoneError("Projects");
}

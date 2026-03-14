import { toErrorResponse } from "@/server/contracts/errors";
import { getWorkspaceBehaviorForCurrentUser } from "@/server/domains/workspaces/service";

/**
 * WHY:   Workspace pages and future client-side consumers need one gateway entrypoint for the composed workspace payload.
 * WHAT:  Returns the current user, profile, organizations, and session context for the active workspace request.
 * HOW:   Delegates to the workspaces domain service and reuses normalized domain error responses on failure.
 */
export async function GET() {
  try {
    const behavior = await getWorkspaceBehaviorForCurrentUser();
    return Response.json(behavior);
  } catch (error) {
    return toErrorResponse(error);
  }
}

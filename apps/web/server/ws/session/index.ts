import { resolveOwnerLinkedSession } from "@/server/auth/guards";
import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import type { WorkspaceAudience, WorkspaceOwnerContext } from "@/server/contracts/workspace";

/**
 * WHY:   Workspace routes may be opened through a selected owner context instead of the raw auth profile alone.
 * WHAT:  Returns a session resolver that backfills broker/developer ownership into the current workspace request.
 * HOW:   Reads the current session once per call, then injects the missing owner id and normalized audience role when needed.
 */
export function buildWorkspaceScopedSessionResolver(
  audience: WorkspaceAudience,
  ownerContext?: WorkspaceOwnerContext | null,
): () => Promise<ResolvedSession> {
  return async () => {
    const session = await requireSessionContext();

    if (audience === "broker" && ownerContext?.ownerType === "broker") {
      return {
        ...session,
        context: {
          ...session.context,
          role: "broker",
          brokerId: session.context.brokerId ?? ownerContext.ownerId,
        },
      };
    }

    if (audience === "broker") {
      const hydrated = await resolveOwnerLinkedSession(session, "brokerId");
      return {
        ...hydrated,
        context: {
          ...hydrated.context,
          role: "broker",
        },
      };
    }

    if (audience === "developer" && ownerContext?.ownerType === "RED") {
      return {
        ...session,
        context: {
          ...session.context,
          role: "developer",
          redId: session.context.redId ?? ownerContext.ownerId,
        },
      };
    }

    if (audience === "developer") {
      const hydrated = await resolveOwnerLinkedSession(session, "redId");
      return {
        ...hydrated,
        context: {
          ...hydrated.context,
          role: "developer",
        },
      };
    }

    return session;
  };
}

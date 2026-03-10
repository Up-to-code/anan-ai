import { query } from "../../_generated/server";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import {
  findProfileForResolvedIdentity,
  requireResolvedIdentity,
} from "../../_core/security/identity";

async function getCurrentProfile(ctx: QueryCtx | MutationCtx) {
  try {
    const identity = await requireResolvedIdentity(ctx);
    const profile = await findProfileForResolvedIdentity(ctx, identity);
    return { identity, profile };
  } catch {
    return null;
  }
}

/**
 * WHY:   Exposes the caller's profile for client-side role gating.
 * WHAT:  Returns role, roleStatus, requestedRole, and organization links.
 * HOW:   Reads from userProfiles keyed by current auth identity.
 */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const current = await getCurrentProfile(ctx);
    if (!current?.profile) return null;
    return {
      role: current.profile.role,
      roleStatus: current.profile.roleStatus,
      requestedRole: current.profile.requestedRole,
      brokerId: current.profile.brokerId,
      REDId: current.profile.REDId,
      isActive: current.profile.isActive,
    } as const;
  },
});

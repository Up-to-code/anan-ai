import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";
import {
  findProfileForResolvedIdentity,
  requireResolvedIdentity,
} from "../../../_core/security/identity";
import type { AssistantOwner } from "./types";

type ReadCtx = QueryCtx | MutationCtx;

/**
 * Resolves the current user's identity and determines their owner type
 * (broker, RED, or standard user) from their profile.
 */
export async function resolveAssistantOwner(ctx: ReadCtx): Promise<AssistantOwner> {
  const identity = await requireResolvedIdentity(ctx);
  const profile = await findProfileForResolvedIdentity(ctx, identity);

  if (profile?.isActive === false) {
    throw new ConvexError({
      code: "ACCOUNT_INACTIVE",
      message: "Account is deactivated",
    });
  }

  if (profile?.brokerId) {
    return {
      userId: identity.authUserId,
      ownerType: "broker",
      ownerBrokerId: profile.brokerId,
    };
  }
  if (profile?.REDId) {
    return {
      userId: identity.authUserId,
      ownerType: "RED",
      ownerREDId: profile.REDId,
    };
  }
  return { userId: identity.authUserId, ownerType: "user" };
}

/**
 * Safe version that returns null instead of throwing when unauthenticated.
 */
export async function resolveAssistantOwnerSafe(
  ctx: ReadCtx
): Promise<AssistantOwner | null> {
  try {
    return await resolveAssistantOwner(ctx);
  } catch {
    return null;
  }
}


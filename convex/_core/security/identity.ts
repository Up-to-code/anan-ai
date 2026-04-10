import { ConvexError } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { getProfileByAuthUserId, getProfileByEmail } from "./profileLookup";
import { getAuthSessionId, getAuthUserId } from "./authIdentity";

type Ctx = QueryCtx | MutationCtx;
type Identity = Awaited<ReturnType<Ctx["auth"]["getUserIdentity"]>>;

export type ResolvedIdentity = {
  identity: NonNullable<Identity>;
  authUserId: string;
  sessionId?: string;
  email?: string;
  name?: string;
};

/**
 * WHY:   The repo needs one backend-auth identity shape regardless of provider details.
 * WHAT:  Resolves Convex Auth identity into stable fields used by security and services.
 * HOW:   Uses Convex Auth helpers when available and falls back to raw identity claims safely.
 */
export async function requireResolvedIdentity(ctx: Ctx): Promise<ResolvedIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
    });
  }

  const authUserId =
    ((await getAuthUserId(ctx as any)) as string | null) ??
    identity.subject;
  const sessionId =
    ((await getAuthSessionId(ctx as any)) as string | null) ??
    identity.tokenIdentifier ??
    undefined;

  return {
    identity,
    authUserId,
    sessionId,
    email: typeof identity.email === "string" ? identity.email : undefined,
    name: typeof identity.name === "string" ? identity.name : undefined,
  };
}

/**
 * WHY:   Existing profiles were created under Better Auth IDs and need a safe migration path.
 * WHAT:  Resolves the matching user profile by current auth user id first, then by email fallback.
 * HOW:   Prefers exact auth key matches and only uses email when the profile key has not been migrated yet.
 */
export async function findProfileForResolvedIdentity(
  ctx: Ctx,
  resolved: ResolvedIdentity,
): Promise<Doc<"userProfiles"> | null> {
  const exact = await getProfileByAuthUserId(ctx, resolved.authUserId);
  if (exact) return exact;

  if (resolved.email) {
    return getProfileByEmail(ctx, resolved.email);
  }

  return null;
}

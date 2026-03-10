import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export type DelegatedAccessContext = {
  userId: Id<"users">;
  authUserId: string;
  clientId: string;
  scopes: string[];
  brokerId?: Id<"brokers">;
  REDId?: Id<"RED">;
  profile: Doc<"userProfiles"> | null;
};

/**
 * WHY:   Delegated OAuth tokens must honor both granted scopes and Anan ownership boundaries.
 * WHAT:  Resolves the delegated caller profile and validates required scopes.
 * HOW:   Loads `userProfiles` by the auth-backed user id and raises standardized FORBIDDEN errors.
 */
export async function requireDelegatedScopes(
  ctx: Ctx,
  delegated: { userId: Id<"users">; clientId: string; scopes: string[] },
  requiredScopes: string[],
): Promise<DelegatedAccessContext> {
  const granted = new Set(delegated.scopes);
  for (const scope of requiredScopes) {
    if (!granted.has(scope)) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: `Missing delegated scope: ${scope}`,
      });
    }
  }

  const authUserId = String(delegated.userId);
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .first();

  if (profile?.isActive === false) {
    throw new ConvexError({
      code: "ACCOUNT_INACTIVE",
      message: "Account is deactivated",
    });
  }

  return {
    userId: delegated.userId,
    authUserId,
    clientId: delegated.clientId,
    scopes: delegated.scopes,
    brokerId: profile?.brokerId,
    REDId: profile?.REDId,
    profile,
  };
}

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
  developerId?: Id<"RED">;
  REDId?: Id<"RED">;
  profile: Doc<"userProfiles"> | null;
};

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
    developerId: (profile as any)?.developerId ?? (profile as any)?.REDId,
    REDId: (profile as any)?.developerId ?? (profile as any)?.REDId,
    profile,
  };
}

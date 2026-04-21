type Ctx = {
  auth: {
    getUserIdentity: () => Promise<{
      subject?: string | null;
      tokenIdentifier?: string | null;
    } | null>;
  };
};

/**
 * WHY:   Backend domain code should not depend directly on a specific auth SDK.
 * WHAT:  Resolves the authenticated subject id from Convex's current user identity.
 * HOW:   Reads `ctx.auth.getUserIdentity()` and returns the JWT subject when present.
 */
export async function getAuthUserId(ctx: Ctx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return typeof identity?.subject === "string" ? identity.subject : null;
}

/**
 * WHY:   Session-aware features still need a stable request/session identifier after the provider migration.
 * WHAT:  Resolves the authenticated session identifier from Convex identity claims.
 * HOW:   Returns Convex's token identifier when present and `null` otherwise.
 */
export async function getAuthSessionId(ctx: Ctx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  return typeof identity?.tokenIdentifier === "string" ? identity.tokenIdentifier : null;
}

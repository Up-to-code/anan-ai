import type { GenericId } from "convex/values";
import { ConvexError } from "convex/values";

type Identity = {
  subject?: string | null;
  tokenIdentifier?: string | null;
  email?: string | null;
};

type TenantGuardCtx = {
  auth: {
    getUserIdentity: () => Promise<Identity | null>;
  };
  db: any;
};

function forbidden(message: string): never {
  throw new ConvexError({ code: "FORBIDDEN", message });
}

async function getCallingAuthUser(ctx: TenantGuardCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  const normalizedSubjectId =
    typeof identity.subject === "string"
      ? ctx.db.normalizeId("authUsers", identity.subject)
      : null;
  if (normalizedSubjectId) {
    const authUser = await ctx.db.get(normalizedSubjectId);
    if (authUser) return authUser;
  }

  const email = typeof identity.email === "string" ? identity.email.trim().toLowerCase() : "";
  if (email) {
    const authUser = await ctx.db
      .query("authUsers")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .unique();
    if (authUser) return authUser;
  }

  forbidden("Authenticated user is not registered in authUsers");
}

/**
 * WHY:   Tenant-owned data must never be read or written before membership is proven.
 * WHAT:  Resolves the calling auth user, worker profile, and org membership for an org.
 * HOW:   Reads Convex auth identity, then uses orgId-first indexes for profile and membership checks.
 */
export async function requireOrgAccess(
  ctx: TenantGuardCtx,
  orgId: GenericId<"organizations">,
) {
  const authUser = await getCallingAuthUser(ctx);

  const userProfile = await ctx.db
    .query("userProfiles")
    .withIndex("by_orgId_and_authUserId", (q: any) =>
      q.eq("orgId", orgId).eq("authUserId", String(authUser._id)),
    )
    .unique();
  if (!userProfile) {
    forbidden("No worker profile exists for this organization");
  }

  const orgMembership = await ctx.db
    .query("orgMemberships")
    .withIndex("by_orgId_and_userProfileId", (q: any) =>
      q.eq("orgId", orgId).eq("userProfileId", userProfile._id),
    )
    .unique();
  if (!orgMembership) {
    forbidden("User is not an active member of this organization");
  }

  return { userProfile, orgMembership };
}

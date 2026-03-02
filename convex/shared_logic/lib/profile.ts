import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export type CurrentProfile = {
  authUserId: string;
  role?: string;
  brokerId?: import("../../_generated/dataModel").Id<"brokers">;
  REDId?: import("../../_generated/dataModel").Id<"RED">;
  isActive?: boolean;
};

type Ctx = QueryCtx | MutationCtx;

export async function getProfileByAuthUserId(ctx: Ctx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .first();
}

export async function requireCurrentProfile(ctx: Ctx): Promise<CurrentProfile> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  const profile = await getProfileByAuthUserId(ctx, identity.subject);
  if (!profile) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
  }

  if (profile.isActive === false) {
    throw new ConvexError({ code: "ACCOUNT_INACTIVE", message: "Account is deactivated" });
  }

  return profile;
}

export async function requireOwnerProfile(
  ctx: Ctx,
): Promise<
  CurrentProfile & (
    | { ownerType: "broker"; ownerBrokerId: import("../../_generated/dataModel").Id<"brokers"> }
    | { ownerType: "RED"; ownerREDId: import("../../_generated/dataModel").Id<"RED"> }
  )
> {
  const profile = await requireCurrentProfile(ctx);
  if (profile.brokerId) {
    return { ...profile, ownerType: "broker", ownerBrokerId: profile.brokerId };
  }
  if (profile.REDId) {
    return { ...profile, ownerType: "RED", ownerREDId: profile.REDId };
  }
  throw new ConvexError({ code: "FORBIDDEN", message: "Organization owner profile required" });
}

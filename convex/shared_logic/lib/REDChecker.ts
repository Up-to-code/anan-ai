import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { ConvexError } from "convex/values";
import { authComponent } from "../../_core/auth";

type CheckerOptions = { requireVerified?: boolean };

/**
 * Throws if not authenticated or not a RED (Real Estate Developer).
 * Returns userId and REDId from userProfiles.
 */
export async function REDChecker(
  ctx: QueryCtx | MutationCtx,
  options: CheckerOptions = {},
): Promise<{ userId: string; REDId: import("../../_generated/dataModel").Id<"RED"> }> {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  const userId = authUser.userId ?? String((authUser as { _id?: string })._id ?? "");
  if (!userId) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid user session" });
  }
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", userId))
    .first();

  const role = profile?.role ?? (authUser as { role?: string }).role ?? "user";
  if (role !== "RED") {
    throw new ConvexError({ code: "FORBIDDEN", message: "RED access required" });
  }
  if (profile?.isActive === false) {
    throw new ConvexError({ code: "ACCOUNT_INACTIVE", message: "Account is deactivated" });
  }

  const REDId = profile?.REDId;
  if (!REDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "RED profile not linked" });
  }

  if (options.requireVerified) {
    const red = await ctx.db.get(REDId);
    if (!red?.isVerified) {
      throw new ConvexError({
        code: "VERIFICATION_REQUIRED",
        message: "RED verification is required for this operation",
      });
    }
  }

  return { userId, REDId };
}

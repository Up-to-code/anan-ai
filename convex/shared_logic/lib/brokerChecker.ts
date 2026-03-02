import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { ConvexError } from "convex/values";
import { authComponent } from "../../_core/auth";

type CheckerOptions = { requireVerified?: boolean };

/**
 * Throws if not authenticated or not a broker.
 * Returns userId and brokerId from userProfiles.
 */
export async function brokerChecker(
  ctx: QueryCtx | MutationCtx,
  options: CheckerOptions = {},
): Promise<{ userId: string; brokerId: import("../../_generated/dataModel").Id<"brokers"> }> {
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
  if (role !== "broker") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Broker access required" });
  }
  if (profile?.isActive === false) {
    throw new ConvexError({ code: "ACCOUNT_INACTIVE", message: "Account is deactivated" });
  }

  const brokerId = profile?.brokerId;
  if (!brokerId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Broker profile not linked" });
  }

  if (options.requireVerified) {
    const broker = await ctx.db.get(brokerId);
    if (!broker?.isVerified) {
      throw new ConvexError({
        code: "VERIFICATION_REQUIRED",
        message: "Broker verification is required for this operation",
      });
    }
  }

  return { userId, brokerId };
}

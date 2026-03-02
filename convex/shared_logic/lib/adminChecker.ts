import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { ConvexError } from "convex/values";
import { authComponent } from "../../_core/auth";

export type AdminOperation =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "developer";

/**
 * Throws if not admin or not permitted for the given operation.
 * Call at the start of every admin query/mutation.
 */
export async function adminChecker(
  ctx: QueryCtx | MutationCtx,
  operation: AdminOperation
): Promise<{ userId: string }> {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }
  const userId = authUser.userId ?? String((authUser as { _id?: string })?._id ?? "");
  if (!userId) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid user session" });
  }
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", userId))
    .first();

  const role = profile?.role ?? (authUser as { role?: string })?.role ?? "user";
  if (role !== "admin") {
    throw new ConvexError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return { userId };
}

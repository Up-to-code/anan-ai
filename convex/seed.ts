/**
 * Seed script: set first admin user.
 * 1. Sign in with Google once in the dashboard.
 * 2. Run: npx convex run seed:setAdminByEmail '{"email":"your@email.com"}'
 *
 * The user must exist in better-auth first (sign up via Google OAuth).
 */
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";

export const setAdminByEmail = mutation({
  args: { email: v.string() },
  returns: v.object({ ok: v.boolean(), userId: v.optional(v.string()) }),
  handler: async (ctx, { email }) => {
    const user = await ctx.runQuery(components.betterAuth.adapter.findOne as any, {
      model: "user",
      where: [{ field: "email", value: email }],
    });
    if (!user || typeof user !== "object") {
      throw new Error(`User not found: ${email}. Sign in with Google first.`);
    }
    const userId = String((user as { _id: string })._id);
    await ctx.runMutation((components.betterAuth.adapter as any).update, {
      model: "user",
      documentId: (user as { _id: string })._id,
      patch: { role: "admin" },
    });
    return { ok: true, userId };
  },
});

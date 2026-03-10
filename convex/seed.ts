/**
 * Seed script: set first admin user.
 * 1. Sign in with Google once in the dashboard.
 * 2. Run: npx convex run seed:setAdminByEmail '{"email":"your@email.com"}'
 *
 * The user must exist in Convex Auth first (sign in with Google OAuth).
 */
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const setAdminByEmail = mutation({
  args: { email: v.string() },
  returns: v.object({ ok: v.boolean(), userId: v.optional(v.string()) }),
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (!user) {
      throw new Error(`User not found: ${email}. Sign in with Google first.`);
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        role: "admin",
        roleStatus: "approved",
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userProfiles", {
        authUserId: String(user._id),
        email,
        name: user.name ?? user.displayName ?? "Admin",
        role: "admin",
        roleStatus: "approved",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { ok: true, userId: String(user._id) };
  },
});

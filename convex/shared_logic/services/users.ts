/**
 * Users service – ensureWhatsAppUser, getByUserId.
 * Plan: event.from = userId (phone). ensureWhatsAppUser before agent.
 */
import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";

export const ensureWhatsAppUser = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) {
      if (args.displayName !== undefined && existing.displayName !== args.displayName) {
        await ctx.db.patch(existing._id, { displayName: args.displayName });
      }
      return existing._id;
    }
    return await ctx.db.insert("users", {
      userId: args.userId,
      displayName: args.displayName,
      channel: "whatsapp",
    });
  },
});

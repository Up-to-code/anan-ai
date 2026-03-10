/**
 * WHY:   WhatsApp channel events need one canonical user upsert path before agent orchestration.
 * WHAT:  Ensures a WhatsApp-scoped user exists and refreshes the display name when it changes.
 * HOW:   Upserts on `users.userId` and stamps the record with the `whatsapp` channel.
 */
import { mutation } from "../../_generated/server";
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

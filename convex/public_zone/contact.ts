import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { enforceHttpRateLimit } from "../shared_logic/lib/middleware/rateLimit";

/**
 * WHY:   Public inquiries need a persistent record so the team can respond and track demand.
 * WHAT:  Stores one contact inquiry in Convex with basic metadata and rate limiting.
 * HOW:   Applies `enforceHttpRateLimit` per IP/email key, then inserts into `contactInquiries`.
 */
export const createContactInquiry = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    sourceIp: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rateKey = args.sourceIp?.trim() ? `contact:${args.sourceIp.trim()}` : `contact:${args.email.trim().toLowerCase()}`;
    await enforceHttpRateLimit(ctx, { key: rateKey });

    const id = await ctx.db.insert("contactInquiries", {
      name: args.name.trim(),
      email: args.email.trim().toLowerCase(),
      message: args.message.trim(),
      sourceIp: args.sourceIp?.trim() || undefined,
      userAgent: args.userAgent?.trim() || undefined,
      createdAt: Date.now(),
    });

    return { id };
  },
});


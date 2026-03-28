import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { enforceHttpRateLimit } from "../shared_logic/lib/middleware/rateLimit";

function normalizeContactField(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

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
    const sourceIp = args.sourceIp?.trim().slice(0, 120) || undefined;
    const userAgent = args.userAgent?.trim().slice(0, 1_000) || undefined;
    const normalized = {
      name: normalizeContactField(args.name, 120),
      email: args.email.trim().toLowerCase().slice(0, 200),
      message: args.message.trim().slice(0, 5_000),
    };
    if (!normalized.name || !normalized.email || !normalized.message) {
      throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Contact inquiry is incomplete" });
    }

    const payloadSize = JSON.stringify({
      ...normalized,
      sourceIp,
      userAgent,
    }).length;
    if (payloadSize > 7_500) {
      throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Contact inquiry is too large" });
    }

    const rateKey = sourceIp ? `contact:${sourceIp}` : `contact:${normalized.email}`;
    await enforceHttpRateLimit(ctx, { key: rateKey });

    const id = await ctx.db.insert("contactInquiries", {
      name: normalized.name,
      email: normalized.email,
      message: normalized.message,
      sourceIp,
      userAgent,
      createdAt: Date.now(),
    });

    return { id };
  },
});

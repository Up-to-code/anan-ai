import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { enforceHttpRateLimit } from "../shared_logic/lib/middleware/rateLimit";

/**
 * WHY:   Public facing forms (like early access, waitlists) need a generic unified endpoint to store submissions.
 * WHAT:  Saves a form payload as a JSON string under a specific form identifier.
 * HOW:   Accepts a constrained schema per known form, applies rate limiting, normalizes payloads, and records it to `formSubmissions`.
 */
export const submitForm = mutation({
  args: {
    formName: v.literal("early-access"),
    data: v.object({
      name: v.string(),
      type: v.union(
        v.literal("investor"),
        v.literal("broker"),
        v.literal("financial_broker"),
        v.literal("developer"),
      ),
      phone: v.string(),
      email: v.optional(v.string()),
    }),
    sourceIp: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sourceIp = args.sourceIp?.trim() || undefined;
    const phoneKey = args.data.phone.trim();
    const rateKey = sourceIp
      ? `form:${args.formName}:${sourceIp}`
      : `form:${args.formName}:phone:${phoneKey || "unknown"}`;
    await enforceHttpRateLimit(ctx, { key: rateKey });

    const normalized = {
      name: args.data.name.trim().slice(0, 100),
      type: args.data.type,
      phone: phoneKey.slice(0, 30),
      ...(args.data.email?.trim()
        ? { email: args.data.email.trim().toLowerCase().slice(0, 200) }
        : {}),
    };

    const payloadString = JSON.stringify(normalized);
    if (payloadString.length > 5_000) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "Payload too large",
      });
    }

    const id = await ctx.db.insert("formSubmissions", {
      formName: args.formName,
      data: payloadString,
      status: "new",
      sourceIp,
      userAgent: args.userAgent?.trim().slice(0, 1_000) || undefined,
      createdAt: Date.now(),
    });

    return { id };
  },
});

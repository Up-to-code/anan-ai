import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * WHY:   Public facing forms (like early access, waitlists) need a generic unified endpoint to store submissions.
 * WHAT:  Saves a form payload as a JSON string under a specific form identifier.
 * HOW:   Accepts `formName` and an arbitrary `data` object, stringifies it, and records it to `formSubmissions`.
 */
export const submitForm = mutation({
  args: {
    formName: v.string(),
    data: v.any(), // Accept any object payload
  },
  handler: async (ctx, args) => {
    // Basic validation to prevent completely empty form names or weird types
    if (!args.formName || typeof args.formName !== "string") {
      throw new Error("Invalid form name provided.");
    }

    const payloadString =
      typeof args.data === "string" ? args.data : JSON.stringify(args.data);

    // Ensure we don't save huge malicious blobs (basic soft limit)
    if (payloadString.length > 50000) {
      throw new Error("Payload too large.");
    }

    const submissionId = await ctx.db.insert("formSubmissions", {
      formName: args.formName.trim(),
      data: payloadString,
      status: "new",
      createdAt: Date.now(),
    });

    return submissionId;
  },
});

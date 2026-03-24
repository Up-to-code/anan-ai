/**
 * WHY:   WhatsApp channel events need one canonical user upsert path before agent orchestration.
 * WHAT:  Ensures a WhatsApp-scoped anonymous channel user exists and refreshes the display name when it changes.
 * HOW:   Delegates to the shared channel-auth helper so phone normalization and auth user identity stay aligned.
 */
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { ensureChannelUserForPhone } from "../../_core/security/channelAuth";

export const ensureWhatsAppUser = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const result = await ensureChannelUserForPhone(ctx, {
      phoneNumber: args.userId,
      displayName: args.displayName,
    });
    return result.userId;
  },
});

import { internalMutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * WHY:   CRM contacts often exist before the person creates a platform account.
 * WHAT:  Links a CRM contact to an auth user and buyer account after signup.
 * HOW:   Internal-only webhook mutation; verifies matching normalized email before patching IDs.
 */
export const linkContactToAuthUser = internalMutation({
  args: {
    contactId: v.id("crmContacts"),
    authUserId: v.id("authUsers"),
  },
  handler: async (ctx, args) => {
    const contact = await ctx.db.get(args.contactId);
    if (!contact) {
      throw new ConvexError({ code: "NOT_FOUND", message: "CRM contact not found" });
    }

    const authUser = await ctx.db.get(args.authUserId);
    if (!authUser) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Auth user not found" });
    }

    if (normalizeEmail(contact.email) !== normalizeEmail(authUser.email)) {
      throw new ConvexError({
        code: "EMAIL_MISMATCH",
        message: "CRM contact email must match auth user email before linking",
      });
    }

    const buyerAccount = await ctx.db
      .query("buyerAccounts")
      .withIndex("by_authUserId", (q) => q.eq("authUserId", args.authUserId))
      .unique();
    if (!buyerAccount) {
      throw new ConvexError({
        code: "BUYER_ACCOUNT_REQUIRED",
        message: "A buyer account must exist before linking this CRM contact",
      });
    }

    await ctx.db.patch(args.contactId, {
      authUserId: args.authUserId,
      buyerAccountId: buyerAccount._id,
    });

    return args.contactId;
  },
});

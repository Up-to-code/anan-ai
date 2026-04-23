import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireOrgAccess } from "../lib/tenantGuard";

/**
 * WHY:   Property publication is the moment inventory becomes buyer- and app-visible.
 * WHAT:  Publishes a property only after tenant access and valid advertising-license checks.
 * HOW:   Requires org membership first, verifies ownership, checks adLicenses, then patches publication fields.
 */
export const publishProperty = mutation({
  args: {
    orgId: v.id("organizations"),
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    await requireOrgAccess(ctx, args.orgId);

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
    }
    if (property.orgId !== args.orgId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot publish another organization's property" });
    }

    const now = Date.now();
    const validLicense = await ctx.db
      .query("adLicenses")
      .withIndex("by_propertyId_and_status", (q) =>
        q.eq("propertyId", args.propertyId).eq("status", "valid"),
      )
      .first();

    if (!validLicense || validLicense.expiresAt <= now) {
      throw new ConvexError({
        code: "AD_LICENSE_REQUIRED",
        message: "A valid advertising license is required before this property can be published",
      });
    }

    await ctx.db.patch(args.propertyId, {
      isPublished: true,
      publishedAt: now,
    });

    return args.propertyId;
  },
});

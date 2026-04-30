import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requirePropertyReadAccess } from "../propertyAccessControl";

/**
 * WHY:   Workspace project detail pages need one read path that also supports shared viewers.
 * WHAT:  Returns a property when the caller is its owner, an explicit viewer, or an inbox-shared viewer.
 * HOW:   Reuses the shared property access guard and returns the loaded property document.
 */
export const getPropertyForViewer = query({
  args: {
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const { property } = await requirePropertyReadAccess(ctx, {
      propertyId: args.propertyId,
      allowInboxShare: true,
    });
    return property;
  },
});

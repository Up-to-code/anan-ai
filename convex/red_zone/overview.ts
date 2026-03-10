import { query } from "../_generated/server";
import { v } from "convex/values";
import { countRedOverviewStats } from "./repositories/overviewRepository";

/**
 * WHY:   Developer server functions need a private Convex query for RED overview counts.
 * WHAT:  Returns overview counts for the provided RED owner id.
 * HOW:   Delegates directly to the RED overview repository service.
 */
export const countPropertiesByRedId = query({
  args: {
    REDId: v.id("RED"),
  },
  handler: async (ctx, args) => {
    return await countRedOverviewStats(ctx, args);
  },
});

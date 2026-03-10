import { query } from "../_generated/server";
import { v } from "convex/values";
import { countBrokerOverviewStats } from "./repositories/overviewRepository";

/**
 * WHY:   Broker server functions need a private Convex query for broker overview counts.
 * WHAT:  Returns overview counts for the provided broker owner id.
 * HOW:   Delegates directly to the broker overview repository service.
 */
export const countPropertiesByBrokerId = query({
  args: {
    brokerId: v.id("brokers"),
  },
  handler: async (ctx, args) => {
    return await countBrokerOverviewStats(ctx, args);
  },
});

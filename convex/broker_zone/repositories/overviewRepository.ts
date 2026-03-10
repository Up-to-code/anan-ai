import { QueryCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * WHY:   Broker server functions still need one low-level way to count properties for a broker owner id.
 * WHAT:  Returns the current property totals for the provided broker id.
 * HOW:   Reads directly from the `properties` table without role or session orchestration.
 */
export async function countBrokerOverviewStats(
  ctx: QueryCtx,
  { brokerId }: { brokerId: Id<"brokers"> },
) {
  const properties = await ctx.db
    .query("properties")
    .withIndex("brokerId", (q) => q.eq("brokerId", brokerId))
    .collect();
  return {
    properties: properties.length,
  };
}

import { QueryCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

/**
 * WHY:   Developer server functions still need one low-level way to count properties for a RED owner id.
 * WHAT:  Returns the current property totals for the provided RED id.
 * HOW:   Reads directly from the `properties` table without role or session orchestration.
 */
export async function countRedOverviewStats(
  ctx: QueryCtx,
  { REDId }: { REDId: Id<"RED"> },
) {
  const properties = await ctx.db
    .query("properties")
    .withIndex("REDId", (q) => q.eq("REDId", REDId))
    .collect();
  return {
    properties: properties.length,
  };
}

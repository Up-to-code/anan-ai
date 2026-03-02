import { QueryCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

export async function overviewStatsService(ctx: QueryCtx, { brokerId }: { brokerId: Id<"brokers"> }) {
    const properties = await ctx.db
        .query("properties")
        .withIndex("brokerId", (q) => q.eq("brokerId", brokerId))
        .collect();
    return {
        properties: properties.length,
    };
}

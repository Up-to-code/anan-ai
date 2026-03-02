import { QueryCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

export async function overviewStatsService(ctx: QueryCtx, { REDId }: { REDId: Id<"RED"> }) {
    const properties = await ctx.db
        .query("properties")
        .withIndex("REDId", (q) => q.eq("REDId", REDId))
        .collect();
    return {
        properties: properties.length,
    };
}

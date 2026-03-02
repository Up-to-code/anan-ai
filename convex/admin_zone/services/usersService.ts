import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";

export async function listUsersService(ctx: QueryCtx, { paginationOpts, channel }: { paginationOpts: any, channel?: string }) {
    let items = await ctx.db
        .query("users")
        .order("desc")
        .paginate(paginationOpts);
    if (channel) {
        const filtered = items.page.filter((u) => u.channel === channel);
        return {
            ...items,
            page: filtered,
            isDone: true,
            continueCursor: null,
        };
    }
    return items;
}

export async function getUserDetailService(ctx: QueryCtx, { userId }: { userId: string }) {
    const user = await ctx.db
        .query("users")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .first();
    if (!user) return null;
    const [knowledgeResearch, searchLogs, agentMemory] = await Promise.all([
        ctx.db
            .query("knowledgeResearch")
            .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
            .collect(),
        ctx.db
            .query("searchLogs")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect(),
        ctx.db
            .query("agentMemory")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect(),
    ]);
    return {
        user,
        counts: {
            knowledgeResearch: knowledgeResearch.length,
            searchLogs: searchLogs.length,
            agentMemory: agentMemory.length,
        },
    };
}

export async function getUserKnowledgeResearchService(ctx: QueryCtx, { userId, limit }: { userId: string, limit: number }) {
    return ctx.db
        .query("knowledgeResearch")
        .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
        .order("desc")
        .take(limit);
}

export async function getUserSearchLogsService(ctx: QueryCtx, { userId, limit }: { userId: string, limit: number }) {
    const logs = await ctx.db
        .query("searchLogs")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .collect();
    return logs
        .sort((a, b) => (b._creationTime ?? 0) - (a._creationTime ?? 0))
        .slice(0, limit);
}

export async function getUserAgentMemoryService(ctx: QueryCtx, { userId }: { userId: string }) {
    return ctx.db
        .query("agentMemory")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .collect();
}

export async function updateUserService(ctx: MutationCtx, { userId, displayName, channel }: { userId: string, displayName?: string, channel?: string }) {
    const user = await ctx.db
        .query("users")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .first();
    if (!user) throw new Error("User not found");
    const patch: Record<string, unknown> = {};
    if (displayName !== undefined) patch.displayName = displayName;
    if (channel !== undefined) patch.channel = channel;
    if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
    }
}

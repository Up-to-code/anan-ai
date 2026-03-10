import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

export const recentActivities = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    await requireRole(ctx, ["admin"]);
    const [research, logs] = await Promise.all([
      ctx.db
        .query("knowledgeResearch")
        .order("desc")
        .take(limit * 2),
      ctx.db.query("searchLogs").collect(),
    ]);

    const logItems = logs
      .map((l) => ({
        id: l._id,
        type: "searchLog" as const,
        userId: l.userId ?? undefined,
        query: l.query,
        createdAt: (l._creationTime ?? 0) * 1000,
        metadata: {
          channel: l.channel,
          stage: l.stage,
          status: l.status,
          errorMessage: l.errorMessage,
        },
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    const researchItems = research.map((r) => ({
      id: r._id,
      type: "knowledgeResearch" as const,
      userId: r.userId,
      query: r.query,
      createdAt: r.createdAt * 1000,
      metadata: {
        channel: r.channel,
        status: r.status,
        threadId: r.threadId,
      },
    }));

    const merged = [...researchItems, ...logItems].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    return merged.slice(0, limit ?? 50);
  },
});

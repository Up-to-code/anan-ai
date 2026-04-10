import { v } from "convex/values";
import { internalQuery } from "../../_generated/server";
import {
  buyerComparisonArtifactValidator,
  buyerComparisonResourceRefValidator,
} from "./types";

const RECENT_REF_LIMIT = 12;

function stripSystemFields<T extends { _id?: unknown; _creationTime?: unknown }>(record: T) {
  const { _id: _ignoredId, _creationTime: _ignoredCreationTime, ...rest } = record;
  return rest;
}

function sourcePriority(source: string) {
  if (source === "ui_selected") return 0;
  if (source === "comparison_request") return 1;
  if (source === "active_property") return 2;
  return 3;
}

/**
 * WHY:   Comparison resolution should prefer explicit selections over passive shortlist history.
 * WHAT:  Returns the latest unique property refs for one thread in priority order.
 * HOW:   Reads recent ref rows, deduplicates by property id, and sorts by source strength then recency.
 */
export const listRecentThreadPropertyRefsInternal = internalQuery({
  args: {
    threadId: v.id("assistantThreads"),
    limit: v.optional(v.number()),
  },
  returns: v.array(buyerComparisonResourceRefValidator),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("buyerThreadResourceRefs")
      .withIndex("threadId_createdAt", (q) => q.eq("threadId", args.threadId))
      .order("desc")
      .take(Math.max((args.limit ?? RECENT_REF_LIMIT) * 4, RECENT_REF_LIMIT));
    const sanitizedRows = rows.map((row) => stripSystemFields(row));

    const deduped = new Map<string, (typeof sanitizedRows)[number]>();
    for (const row of sanitizedRows) {
      const key = String(row.resourceId);
      const existing = deduped.get(key);
      if (!existing) {
        deduped.set(key, row);
        continue;
      }
      if (sourcePriority(row.source) < sourcePriority(existing.source)) {
        deduped.set(key, row);
      }
    }

    return [...deduped.values()]
      .sort((left, right) => {
        const priorityDelta = sourcePriority(left.source) - sourcePriority(right.source);
        if (priorityDelta !== 0) return priorityDelta;
        return right.createdAt - left.createdAt;
      })
      .slice(0, args.limit ?? RECENT_REF_LIMIT);
  },
});

/**
 * WHY:   Thread replay and message hydration need direct access to one stored comparison artifact.
 * WHAT:  Returns a comparison artifact only when it belongs to the requested thread.
 * HOW:   Guards replay scope by checking the artifact thread id before returning the snapshot.
 */
export const getBuyerComparisonArtifactInternal = internalQuery({
  args: {
    artifactId: v.id("buyerComparisonArtifacts"),
    threadId: v.optional(v.id("assistantThreads")),
  },
  returns: v.union(v.null(), buyerComparisonArtifactValidator),
  handler: async (ctx, args) => {
    const artifact = await ctx.db.get(args.artifactId);
    if (!artifact) return null;
    if (args.threadId && String(artifact.threadId) !== String(args.threadId)) {
      return null;
    }
    return stripSystemFields(artifact);
  },
});

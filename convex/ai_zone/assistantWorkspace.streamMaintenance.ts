import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import { requireRole } from "../_core/security/accessPolicy";

type StreamEventRecord = Doc<"assistantStreamEvents">;

async function purgeStreamEventsBatch(
  ctx: any,
  args: {
    mode: "legacyOnly" | "all";
    batchSize: number;
    dryRun: boolean;
  },
) {
  const events = await ctx.db.query("assistantStreamEvents").collect();
  const candidates = events
    .filter((event: StreamEventRecord) => (args.mode === "all" ? true : !event.eventType))
    .sort((a: StreamEventRecord, b: StreamEventRecord) => a.createdAt - b.createdAt);
  const batch = candidates.slice(0, args.batchSize);

  if (!args.dryRun) {
    for (const event of batch) {
      await ctx.db.delete(event._id);
    }
  }

  return {
    ok: true as const,
    mode: args.mode,
    dryRun: args.dryRun,
    batchSize: args.batchSize,
    matchedCount: candidates.length,
    selectedCount: batch.length,
    deletedCount: args.dryRun ? 0 : batch.length,
    remainingCountEstimate: Math.max(0, candidates.length - batch.length),
  };
}

function sanitizeBatchSize(rawBatchSize: number | undefined) {
  return Math.min(Math.max(Math.floor(rawBatchSize ?? 500), 1), 5_000);
}

export const _purgeStreamEvents = internalMutation({
  args: {
    mode: v.optional(v.union(v.literal("legacyOnly"), v.literal("all"))),
    batchSize: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return purgeStreamEventsBatch(ctx, {
      mode: args.mode ?? "all",
      batchSize: sanitizeBatchSize(args.batchSize),
      dryRun: args.dryRun ?? false,
    });
  },
});

export const purgeStreamEvents = mutation({
  args: {
    mode: v.optional(v.union(v.literal("legacyOnly"), v.literal("all"))),
    batchSize: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return purgeStreamEventsBatch(ctx, {
      mode: args.mode ?? "all",
      batchSize: sanitizeBatchSize(args.batchSize),
      dryRun: args.dryRun ?? false,
    });
  },
});

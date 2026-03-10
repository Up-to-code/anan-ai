/**
 * ragActions.ts — Internal mutations for RAG entry tracking
 *
 * WHY:   Actions cannot write to DB directly.
 * WHAT:  Provide internal mutations to record aiRAGEntries.
 * HOW:   Inserts into aiRAGEntries with pending status.
 */
import { internalMutation } from "../../../_generated/server";
import { v } from "convex/values";

export const createRagEntryInternal = internalMutation({
  args: {
    ragType: v.union(v.literal("production"), v.literal("recommendation")),
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    target: v.union(v.literal("user"), v.literal("broker"), v.literal("RED"), v.literal("all")),
    suggestedBy: v.optional(v.string()),
  },
  returns: v.id("aiRAGEntries"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("aiRAGEntries", {
      ragType: args.ragType,
      title: args.title,
      content: args.content,
      category: args.category,
      target: args.target,
      status: "pending",
      suggestedBy: args.suggestedBy,
      createdAt: Date.now(),
    });
  },
});

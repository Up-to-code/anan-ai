/**
 * WHY:   Knowledge agents and content pages need one low-level content lookup entrypoint.
 * WHAT:  Reads knowledge pages by slug or category.
 * HOW:   Queries `knowledgePages` through indexed reads and returns raw page rows.
 */
import { query } from "../../_generated/server";
import { v } from "convex/values";

/** Get knowledge page by slug. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query("knowledgePages")
      .withIndex("slug", (q) => q.eq("slug", slug))
      .first();
  },
});

/** List knowledge pages (optional). */
export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, { category }) => {
    if (category) {
      return ctx.db
        .query("knowledgePages")
        .withIndex("category", (q) => q.eq("category", category))
        .collect();
    }
    return ctx.db.query("knowledgePages").collect();
  },
});

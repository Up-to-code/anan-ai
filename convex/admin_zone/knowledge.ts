import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";

export const listKnowledgePages = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminAccess(ctx);
    return ctx.db.query("knowledgePages").collect();
  },
});

export const getKnowledgePage = query({
  args: { id: v.id("knowledgePages") },
  handler: async (ctx, { id }) => {
    await requireAdminAccess(ctx);
    return ctx.db.get(id);
  },
});

export const createKnowledgePage = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx);
    return ctx.db.insert("knowledgePages", args);
  },
});

export const updateKnowledgePage = mutation({
  args: {
    id: v.id("knowledgePages"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdminAccess(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "Knowledge page not found" });
    const filtered = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    if (Object.keys(filtered).length > 0) {
      await ctx.db.patch(id, filtered);
    }
  },
});

export const deleteKnowledgePage = mutation({
  args: { id: v.id("knowledgePages") },
  handler: async (ctx, { id }) => {
    await requireAdminAccess(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "Knowledge page not found" });
    await ctx.db.delete(id);
  },
});

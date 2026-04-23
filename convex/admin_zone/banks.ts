import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";

export const listBanks = query({
  args: {},
  handler: async (ctx) => {
    await requireAdminAccess(ctx);
    return ctx.db.query("banks").order("desc").collect();
  },
});

export const getBank = query({
  args: { id: v.id("banks") },
  handler: async (ctx, { id }) => {
    await requireAdminAccess(ctx);
    return ctx.db.get(id);
  },
});

export const createBank = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    contactEmail: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx);
    return ctx.db.insert("banks", args);
  },
});

export const updateBank = mutation({
  args: {
    id: v.id("banks"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdminAccess(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "Bank not found" });
    const filtered = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    if (Object.keys(filtered).length > 0) {
      await ctx.db.patch(id, filtered);
    }
  },
});

export const deleteBank = mutation({
  args: { id: v.id("banks") },
  handler: async (ctx, { id }) => {
    await requireAdminAccess(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "Bank not found" });
    await ctx.db.delete(id);
  },
});

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { adminChecker } from "../shared_logic/lib/adminChecker";

export const listBanks = query({
  args: {},
  handler: async (ctx) => {
    await adminChecker(ctx, "read");
    return ctx.db.query("banks").order("desc").collect();
  },
});

export const getBank = query({
  args: { id: v.id("banks") },
  handler: async (ctx, { id }) => {
    await adminChecker(ctx, "read");
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
    await adminChecker(ctx, "create");
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
    await adminChecker(ctx, "update");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Bank not found");
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
    await adminChecker(ctx, "delete");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Bank not found");
    await ctx.db.delete(id);
  },
});

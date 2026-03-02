import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { adminChecker } from "../shared_logic/lib/adminChecker";

export const listREDs = query({
  args: {},
  handler: async (ctx) => {
    await adminChecker(ctx, "read");
    return ctx.db.query("RED").collect();
  },
});

export const getRED = query({
  args: { id: v.id("RED") },
  handler: async (ctx, { id }) => {
    await adminChecker(ctx, "read");
    const RED = await ctx.db.get(id);
    if (!RED) return null;
    const properties = await ctx.db
      .query("properties")
      .withIndex("REDId", (q) => q.eq("REDId", id))
      .collect();
    return { ...RED, properties };
  },
});

export const createRED = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    status: v.optional(v.union(v.literal("active"), v.literal("pending"))),
    contactEmail: v.optional(v.string()),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await adminChecker(ctx, "create");
    return ctx.db.insert("RED", args);
  },
});

export const updateRED = mutation({
  args: {
    id: v.id("RED"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("pending"))),
    contactEmail: v.optional(v.string()),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await adminChecker(ctx, "update");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("RED not found");
    const filtered = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    if (Object.keys(filtered).length > 0) {
      await ctx.db.patch(id, filtered);
    }
  },
});

export const deleteRED = mutation({
  args: { id: v.id("RED") },
  handler: async (ctx, { id }) => {
    await adminChecker(ctx, "delete");
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("RED not found");
    await ctx.db.delete(id);
  },
});

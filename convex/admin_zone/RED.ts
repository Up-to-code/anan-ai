import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

export const listREDs = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    return ctx.db.query("RED").collect();
  },
});

export const getRED = query({
  args: { id: v.id("RED") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin"]);
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
    await requireRole(ctx, ["admin"]);
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
    await requireRole(ctx, ["admin"]);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "RED not found" });
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
    await requireRole(ctx, ["admin"]);
    const existing = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "RED not found" });
    await ctx.db.delete(id);
  },
});

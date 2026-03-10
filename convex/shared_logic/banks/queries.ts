/**
 * WHY:   Finance agents and bank-facing UI need stable read access to bank catalog data.
 * WHAT:  Lists banks, fetches bank details, and flattens bank products into bundle summaries.
 * HOW:   Reads directly from `banks` and projects nested product arrays when requested.
 */
import { query } from "../../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    return ctx.db.query("banks").order("desc").take(limit);
  },
});

export const getById = query({
  args: { id: v.id("banks") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query("banks")
      .withIndex("slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getBundles = query({
  args: { bankId: v.optional(v.id("banks")) },
  handler: async (ctx, { bankId }) => {
    const banks = bankId
      ? [await ctx.db.get(bankId)].filter(Boolean)
      : await ctx.db.query("banks").take(50);
    return (banks as NonNullable<(typeof banks)[0]>[]).flatMap((b) =>
      (b?.products ?? []).map((p) => ({
        bankName: b.name,
        bankSlug: b.slug,
        bankId: b._id,
        ...p,
      })),
    );
  },
});

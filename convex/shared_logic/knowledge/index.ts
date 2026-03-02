import { query } from "../../_generated/server";
import { v } from "convex/values";

function scoreSnippet(content: string, terms: string[]) {
  const lower = content.toLowerCase();
  return terms.reduce((acc, term) => (lower.includes(term) ? acc + 1 : acc), 0);
}

export const retrieveCompanyKnowledge = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const terms = args.query
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);
    const limit = Math.max(1, Math.min(args.limit ?? 4, 8));

    const pages = await ctx.db.query("knowledgePages").collect();
    const scored = pages
      .map((page) => ({
        page,
        score: scoreSnippet(`${page.title}\n${page.content}\n${page.category ?? ""}`, terms),
      }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((row) => ({
        id: row.page._id,
        title: row.page.title,
        category: row.page.category ?? null,
        excerpt: row.page.content.slice(0, 500),
      }));

    return scored;
  },
});

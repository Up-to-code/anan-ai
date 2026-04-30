import { query } from "../../_generated/server";
import { v } from "convex/values";
import {
  requireAdminAccess,
  requireEntitlements,
} from "../../_core/security/accessPolicy";

function normalizeSearchQuery(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

/**
 * WHY:   Workspace engineers need fast, safe backend guidance without scanning large tables or mixing product knowledge with developer rules.
 * WHAT:  Retrieves developer handbook snippets by text search for broker/developer/admin callers.
 * HOW:   Enforces role gate, uses Convex search indexes (no `collect()`), and returns bounded excerpts only.
 */
export const retrieveDeveloperHandbookSnippets = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      await requireAdminAccess(ctx, "admin:system");
    } catch {
      await requireEntitlements(ctx, ["workspace:broker", "workspace:developer"]);
    }

    const normalized = normalizeSearchQuery(args.query);
    if (!normalized) return [];

    const limit = Math.max(1, Math.min(args.limit ?? 4, 8));

    const byContent = await ctx.db
      .query("developerHandbookPages")
      .withSearchIndex("search_content", (s) => s.search("content", normalized))
      .take(limit * 2);

    const byTitle =
      byContent.length >= limit
        ? []
        : await ctx.db
            .query("developerHandbookPages")
            .withSearchIndex("search_title", (s) => s.search("title", normalized))
            .take(limit * 2);

    const merged = new Map<string, any>();
    for (const page of [...byContent, ...byTitle]) {
      merged.set(String(page._id), page);
    }

    return Array.from(merged.values())
      .slice(0, limit)
      .map((page) => ({
        slug: page.slug,
        title: page.title,
        category: page.category ?? null,
        excerpt: String(page.content).slice(0, 700),
      }));
  },
});

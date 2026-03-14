/**
 * Seed script: set first admin user.
 * 1. Sign in with Google once in the dashboard.
 * 2. Run: npx convex run seed:setAdminByEmail '{"email":"your@email.com"}'
 *
 * The user must exist in Convex Auth first (sign in with Google OAuth).
 */
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const setAdminByEmail = mutation({
  args: { email: v.string() },
  returns: v.object({ ok: v.boolean(), userId: v.optional(v.string()) }),
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (!user) {
      throw new Error(`User not found: ${email}. Sign in with Google first.`);
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        role: "admin",
        roleStatus: "approved",
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userProfiles", {
        authUserId: String(user._id),
        email,
        name: user.name ?? user.displayName ?? "Admin",
        role: "admin",
        roleStatus: "approved",
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { ok: true, userId: String(user._id) };
  },
});

/**
 * Seed script: populate developer handbook pages.
 *
 * WHY:   The platform assistant and engineers need a curated, secret-free rules knowledge base without scanning or mixing it into product knowledge.
 * WHAT:  Upserts a set of `developerHandbookPages` rows keyed by slug.
 * HOW:   Uses the `slug` index to upsert pages and updates timestamps for repeatable runs.
 */
export const seedDeveloperHandbookPages = mutation({
  args: {},
  returns: v.object({
    ok: v.boolean(),
    inserted: v.number(),
    updated: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const pages: Array<{
      slug: string;
      title: string;
      category: string;
      tags: string[];
      content: string;
    }> = [
      {
        slug: "start-here",
        title: "Start here: the Anan backend rules",
        category: "onboarding",
        tags: ["convex", "architecture", "rules"],
        content: [
          "Read in order:",
          "- ARCHITECTURE.md",
          "- CONVEX_RULES.md",
          "- docs/handbook/README.md",
          "- docs/handbook/security/README.md",
          "",
          "Non-negotiable:",
          "- Thin entrypoints (route files, controllers, httpAction handlers).",
          "- Zone boundaries are strict (no cross-zone deep imports).",
          "- AuthZ is explicit: auth → role gate → row ownership → state prerequisites.",
          "- Performance: index-first, search-index-first, no unbounded collect().",
        ].join("\n"),
      },
      {
        slug: "authz-checklist",
        title: "AuthZ checklist (prevent permission bugs)",
        category: "security",
        tags: ["auth", "authorization", "ownership", "security"],
        content: [
          "Checklist for every protected query/mutation/action/httpAction:",
          "1) Authentication: unauthenticated fails early unless explicitly public.",
          "2) Role gate: reject-by-default if role is unknown.",
          "3) Ownership: verify every input id belongs to the caller’s resolved owner context.",
          "4) State prerequisites: verify prior state and block repeated transitions.",
          "5) Least privilege: return stable projections (no raw rows, no unnecessary PII).",
          "",
          "Repo references:",
          "- convex/_core/security/identity.ts",
          "- convex/_core/security/accessPolicy.ts",
          "- docs/handbook/security/authorization.md",
        ].join("\n"),
      },
      {
        slug: "queries-mutations-actions-http",
        title: "Queries vs mutations vs actions vs httpAction (when to use what)",
        category: "convex",
        tags: ["convex", "query", "mutation", "action", "httpAction"],
        content: [
          "Queries: deterministic reads. No side effects.",
          "Mutations: writes/state transitions. Verify prior state + ownership.",
          "Actions: external I/O and non-determinism (LLMs, vendor APIs).",
          "httpAction: external ingress (webhooks/OAuth). Must be thin and delegated.",
          "",
          "Official reference:",
          "- https://docs.convex.dev/functions",
          "- https://docs.convex.dev/functions/http-actions",
        ].join("\n"),
      },
      {
        slug: "performance-index-first",
        title: "Performance: index-first, summary queries, and scan avoidance",
        category: "performance",
        tags: ["performance", "indexes", "pagination", "summary"],
        content: [
          "Rules:",
          "- Prefer withIndex + eq constraints for lookups.",
          "- Prefer searchIndex + withSearchIndex for text retrieval.",
          "- Avoid unbounded collect() on growth tables.",
          "- Avoid take(N) correctness traps for lookups.",
          "- Prefer summary queries over list-then-reduce.",
          "",
          "Official reference:",
          "- https://docs.convex.dev/database",
          "- https://docs.convex.dev/search",
        ].join("\n"),
      },
      {
        slug: "search-index-pattern",
        title: "Full-text search pattern (schema + query)",
        category: "convex",
        tags: ["search", "indexes", "withSearchIndex"],
        content: [
          "Schema:",
          "- defineTable(...).searchIndex(name, { searchField })",
          "",
          "Query:",
          "- ctx.db.query(table).withSearchIndex(name, s => s.search(field, query)).take(limit)",
          "",
          "Repo reference implementation:",
          "- convex/_core/schema/properties.ts",
          "- convex/shared_logic/properties/search.ts",
        ].join("\n"),
      },
      {
        slug: "webhooks-idempotency",
        title: "Webhooks: idempotency, dedupe, replay safety",
        category: "channels",
        tags: ["webhook", "idempotency", "channels"],
        content: [
          "Rules:",
          "- Webhooks retry. Treat vendor message/event id as dedupe key.",
          "- Keep handlers thin: parse/validate/dedupe → delegate → reply.",
          "- Do not log raw webhook bodies.",
          "- Use safe fallbacks when vendor calls fail.",
          "",
          "Repo blueprint:",
          "- convex/http.ts",
          "- convex/ai_zone/channels/whatsapp/webhook.ts",
          "- docs/handbook/convex/channels.md",
        ].join("\n"),
      },
      {
        slug: "agent-tool-boundaries",
        title: "Agentic architecture: orchestrator vs agents vs tools",
        category: "ai",
        tags: ["ai", "agents", "tools", "orchestrator"],
        content: [
          "Rules:",
          "- Orchestrator selects teams/agents; agents call tools.",
          "- Tools must enforce access/ownership like normal handlers.",
          "- Keep prompt context minimal and structured; avoid table dumps.",
          "- Never log prompts, thread history, or PII.",
          "",
          "Repo references:",
          "- convex/ai_zone/agents/anan/orchestrate.ts",
          "- convex/ai_zone/agents/anan/intentAnalyzer.ts",
          "- docs/handbook/convex/ai-zone.md",
        ].join("\n"),
      },
      {
        slug: "zone-boundaries",
        title: "Zone boundaries (where code belongs)",
        category: "architecture",
        tags: ["zones", "architecture"],
        content: [
          "Convex zones:",
          "- _core: schema + security + auth/OAuth internals (no business handlers).",
          "- shared_logic: shared business capabilities (inbox/offers/market/properties).",
          "- ai_zone: assistant runtime + channels.",
          "- user_zone: buyer/mobile backend.",
          "- broker_zone/red_zone: owner-scoped adapters.",
          "- admin_zone: admin projections/ops.",
          "- public_zone: public entry features.",
          "",
          "Deep reference:",
          "- docs/handbook/convex/zones.md",
          "- convex/*/ZONE_README.md",
        ].join("\n"),
      },
      {
        slug: "red-vs-developer",
        title: "Naming: RED vs developer (don’t invent a third convention)",
        category: "architecture",
        tags: ["naming", "RED", "developer"],
        content: [
          "Rule:",
          "- Storage/schema uses RED and REDId in many places.",
          "- Surfaces may normalize to developer/redId at contract boundaries.",
          "- Do not store duplicate fields with different naming.",
          "",
          "Reference:",
          "- CONVEX_RULES.md",
          "- docs/handbook/glossary.md",
        ].join("\n"),
      },
      {
        slug: "github-governance",
        title: "GitHub governance (prevent unsafe merges)",
        category: "process",
        tags: ["github", "codeowners", "review", "security"],
        content: [
          "Use CODEOWNERS + PR checklists to prevent:",
          "- authZ regressions,",
          "- cross-zone drift,",
          "- scan-based queries,",
          "- webhook idempotency failures.",
          "",
          "Repo references:",
          "- .github/PULL_REQUEST_TEMPLATE.md",
          "- .github/CODEOWNERS",
          "- .github/SECURITY.md",
        ].join("\n"),
      },
    ];

    let inserted = 0;
    let updated = 0;

    for (const page of pages) {
      const existing = await ctx.db
        .query("developerHandbookPages")
        .withIndex("slug", (q) => q.eq("slug", page.slug))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          title: page.title,
          content: page.content,
          category: page.category,
          tags: page.tags,
          updatedAt: now,
        } as any);
        updated += 1;
      } else {
        await ctx.db.insert("developerHandbookPages", {
          slug: page.slug,
          title: page.title,
          content: page.content,
          category: page.category,
          tags: page.tags,
          createdAt: now,
          updatedAt: now,
        } as any);
        inserted += 1;
      }
    }

    return { ok: true, inserted, updated };
  },
});

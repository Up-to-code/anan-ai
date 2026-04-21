/**
 * Seed script: set first admin user.
 * 1. Sign in with Google once in the dashboard.
 * 2. Run: npx convex run seed:setAdminByEmail '{"email":"your@email.com"}'
 *
 * The user must exist in Convex Auth first (sign in with Google OAuth).
 */
import { action, internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { buildPropertySearchText } from "./shared_logic/properties/searchText";
import {
  buildSaudiSeedSummary,
  ensureSaudiPlaygroundNetwork,
  ensureSaudiSeedBanks,
  seedSaudiOrganizationChunk,
} from "./seed/saudiWorkspaceDataset";

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
        roleApprovalStatus: "approved",
        requestedRole: undefined,
        brokerId: undefined,
        developerId: undefined,
        REDId: undefined,
        roleStatus: undefined,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userProfiles", {
        authUserId: String(user._id),
        email,
        name: user.name ?? user.displayName ?? "Admin",
        role: "admin",
        roleApprovalStatus: "approved",
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

type SeedBrokerInput = {
  slug: string;
  name: string;
  contactEmail: string;
  phone: string;
  description: string;
  agencyLabel: string;
  rating: number;
};

type SeedDeveloperInput = {
  slug: string;
  name: string;
  contactEmail: string;
  phone: string;
  description: string;
  establishedYear: number;
  completedProjects: number;
};

async function upsertComplianceRuleset(ctx: any, args: { orgType: "broker" | "red"; now: number }) {
  const existing = await ctx.db
    .query("complianceRulesets")
    .withIndex("country_org_status", (q: any) =>
      q.eq("countryCode", "SA").eq("orgType", args.orgType).eq("status", "active"),
    )
    .first();

  const payload = {
    countryCode: "SA",
    countryLabel: "المملكة العربية السعودية",
    orgType: args.orgType,
    status: "active" as const,
    version: 1,
    requirements: [],
    sources: [],
    enforcement: {
      blockPublish: true,
      hideUnverified: true,
      showBanner: true,
      requireOrgVerification: true,
      requireListingVerification: true,
    },
    createdAt: args.now,
    updatedAt: args.now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, { ...payload, createdAt: existing.createdAt ?? args.now });
    return existing._id;
  }

  return ctx.db.insert("complianceRulesets", payload);
}

async function upsertBroker(ctx: any, broker: SeedBrokerInput) {
  const metadata = JSON.stringify({
    agencyLabel: broker.agencyLabel,
    rating: broker.rating,
  });
  const existing = await ctx.db
    .query("brokers")
    .withIndex("slug", (q: any) => q.eq("slug", broker.slug))
    .first();

  const payload = {
    name: broker.name,
    slug: broker.slug,
    status: "active" as const,
    isVerified: true,
    contactEmail: broker.contactEmail,
    phone: broker.phone,
    description: broker.description,
    countryCode: "SA",
    notes: metadata,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return ctx.db.insert("brokers", payload);
}

async function upsertDeveloper(ctx: any, developer: SeedDeveloperInput) {
  const metadata = JSON.stringify({
    establishedYear: developer.establishedYear,
    completedProjects: developer.completedProjects,
  });
  const existing = await ctx.db
    .query("RED")
    .withIndex("slug", (q: any) => q.eq("slug", developer.slug))
    .first();

  const payload = {
    name: developer.name,
    slug: developer.slug,
    status: "active" as const,
    isVerified: true,
    contactEmail: developer.contactEmail,
    phone: developer.phone,
    description: developer.description,
    countryCode: "SA",
    notes: metadata,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return ctx.db.insert("RED", payload);
}

async function upsertBank(ctx: any, args: {
  slug: string;
  name: string;
  contactEmail: string;
  description: string;
  products: Array<{
    name: string;
    type: string;
    description: string;
    rules: {
      interestRate: number;
      minDownPaymentPercent: number;
    };
  }>;
}) {
  const existing = await ctx.db
    .query("banks")
    .withIndex("slug", (q: any) => q.eq("slug", args.slug))
    .first();

  const payload = {
    name: args.name,
    slug: args.slug,
    contactEmail: args.contactEmail,
    description: args.description,
    status: "active" as const,
    products: args.products,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return ctx.db.insert("banks", payload);
}

async function upsertProperty(ctx: any, args: {
  ownerType: "broker" | "red";
  ownerId: any;
  title: string;
  address: string;
  location: string;
  area: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  bankId?: any;
  publicationState: "draft" | "published";
  media: Array<{ key: string; url: string; name: string }>;
}) {
  const existingRows =
    args.ownerType === "broker"
      ? await ctx.db.query("properties").withIndex("brokerId", (q: any) => q.eq("brokerId", args.ownerId)).collect()
      : await ctx.db.query("properties").withIndex("REDId", (q: any) => q.eq("REDId", args.ownerId)).collect();
  const existing = existingRows.find((row: any) => row.title === args.title);
  const payload = {
    title: args.title,
    address: args.address,
    location: args.location,
    area: args.area,
    description: args.description,
    price: args.price,
    beds: args.beds,
    baths: args.baths,
    sqft: args.sqft,
    bankId: args.bankId,
    status: "available" as const,
    publicationState: args.publicationState,
    adLicenseNumber: `LIC-${args.title.replace(/\s+/g, "-").slice(0, 24)}`,
    adLicenseStatus: "approved" as const,
    media: args.media,
    heroImage: args.media[0],
    searchText: buildPropertySearchText({
      title: args.title,
      address: args.address,
      description: args.description,
      location: args.location,
      area: args.area,
    }),
    body: {
      presentation: {
        descriptionShort: args.description.slice(0, 120),
        amenities: ["مواقف", "مصاعد", "نادي", "لوبي فاخر"],
        parkingSpaces: 2,
        hasParking: true,
        slides: args.media,
        coverImageKey: args.media[0]?.key,
      },
    },
    ...(args.ownerType === "broker" ? { brokerId: args.ownerId } : { REDId: args.ownerId }),
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return ctx.db.insert("properties", payload);
}

async function upsertCrmClient(ctx: any, args: {
  ownerAuthUserId: string;
  brokerId?: any;
  REDId?: any;
  name: string;
  phone: string;
  email: string;
  notes: string;
  now: number;
}) {
  const rows = await ctx.db.query("crmClients").withIndex("ownerAuthUserId", (q: any) => q.eq("ownerAuthUserId", args.ownerAuthUserId)).collect();
  const existing = rows.find((row: any) => row.name === args.name);
  const payload = {
    ownerAuthUserId: args.ownerAuthUserId,
    brokerId: args.brokerId,
    REDId: args.REDId,
    name: args.name,
    phone: args.phone,
    email: args.email,
    notes: args.notes,
    createdAt: args.now,
    updatedAt: args.now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return ctx.db.insert("crmClients", payload);
}

async function upsertOrder(ctx: any, args: {
  userId: string;
  type: "property" | "loan";
  propertyId?: any;
  bankId?: any;
  REDId?: any;
  intent: string;
  notes: string;
  sourceChannel: "web";
}) {
  const rows = await ctx.db.query("orders").withIndex("userId", (q: any) => q.eq("userId", args.userId)).collect();
  const existing = rows.find((row: any) => row.intent === args.intent && row.propertyId === args.propertyId);
  const payload = {
    userId: args.userId,
    type: args.type,
    status: "qualified" as const,
    propertyId: args.propertyId,
    bankId: args.bankId,
    REDId: args.REDId,
    intent: args.intent,
    notes: args.notes,
    sourceChannel: args.sourceChannel,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return ctx.db.insert("orders", payload);
}

export const seedArabicDevelopmentEcosystem = mutation({
  args: {},
  returns: v.object({
    ok: v.boolean(),
    brokers: v.number(),
    developers: v.number(),
    banks: v.number(),
    properties: v.number(),
    clients: v.number(),
    orders: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    await upsertComplianceRuleset(ctx, { orgType: "broker", now });
    await upsertComplianceRuleset(ctx, { orgType: "red", now });

    const redOne = await upsertDeveloper(ctx, {
      slug: "etijah-developer-demo",
      name: "اتجاه للتطوير",
      contactEmail: "developer@etijah.demo",
      phone: "+966500000101",
      description: "مطور سكني يركز على شقق الرياض والمجتمعات السكنية الجاهزة للبيع والتمويل.",
      establishedYear: 2012,
      completedProjects: 18,
    });
    const redTwo = await upsertDeveloper(ctx, {
      slug: "binaa-demo",
      name: "بناء النخبة",
      contactEmail: "sales@binaa.demo",
      phone: "+966500000102",
      description: "شركة تطوير تقدم مشاريع سكنية واستثمارية بمخططات سداد متنوعة داخل الرياض وجدة.",
      establishedYear: 2016,
      completedProjects: 11,
    });

    const brokerOne = await upsertBroker(ctx, {
      slug: "riyadh-advisors-demo",
      name: "مستشارو الرياض",
      contactEmail: "advisor@riyadh-demo.com",
      phone: "+966500000201",
      description: "فريق وساطة يرافق العميل من اختيار الشقة حتى التمويل والمعاينة.",
      agencyLabel: "مستشارو الرياض العقارية",
      rating: 4.8,
    });
    const brokerTwo = await upsertBroker(ctx, {
      slug: "jeddah-broker-demo",
      name: "وسيط جدة الذكي",
      contactEmail: "hello@jeddah-demo.com",
      phone: "+966500000202",
      description: "وسيط يركز على الشقق الساحلية والمنتجات البنكية المناسبة للشراء الأول.",
      agencyLabel: "وسيط جدة الذكي",
      rating: 4.6,
    });

    const bankOne = await upsertBank(ctx, {
      slug: "alahli-demo",
      name: "البنك الأهلي السعودي",
      contactEmail: "mortgage@alahli.demo",
      description: "حلول تمويل سكني للشقق الجاهزة مع دفعات أولى مرنة.",
      products: [
        {
          name: "تمويل الشقق الجاهزة",
          type: "mortgage",
          description: "تمويل مخصص للوحدات السكنية الجاهزة داخل المدن الرئيسية.",
          rules: { interestRate: 4.35, minDownPaymentPercent: 10 },
        },
      ],
    });
    const bankTwo = await upsertBank(ctx, {
      slug: "rajhi-demo",
      name: "مصرف الراجحي",
      contactEmail: "housing@rajhi.demo",
      description: "منتج تمويل عقاري بمسارات سداد ثابتة ومعدلات تنافسية.",
      products: [
        {
          name: "تمويل الشراء الأول",
          type: "mortgage",
          description: "حل تمويلي مناسب للعملاء الباحثين عن أول شقة سكنية.",
          rules: { interestRate: 4.65, minDownPaymentPercent: 15 },
        },
      ],
    });

    const properties = [
      await upsertProperty(ctx, {
        ownerType: "red",
        ownerId: redOne,
        title: "شقق أفق الياسمين",
        address: "الياسمين، شمال الرياض",
        location: "الرياض",
        area: "الياسمين",
        description: "شقق جاهزة للسكن بتشطيبات هادئة وقريبة من المدارس والمحاور الرئيسية.",
        price: 1280000,
        beds: 3,
        baths: 3,
        sqft: 168,
        bankId: bankOne,
        publicationState: "published",
        media: [
          { key: "yasmin-1", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", name: "yasmin-1.jpg" },
          { key: "yasmin-2", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80", name: "yasmin-2.jpg" },
        ],
      }),
      await upsertProperty(ctx, {
        ownerType: "red",
        ownerId: redTwo,
        title: "برج النرجس ريزيدنس",
        address: "النرجس، الرياض",
        location: "الرياض",
        area: "النرجس",
        description: "مشروع شقق حديث يناسب السكن والاستثمار مع لوبي فاخر ومساحات عملية.",
        price: 1490000,
        beds: 3,
        baths: 4,
        sqft: 182,
        bankId: bankTwo,
        publicationState: "published",
        media: [
          { key: "narjis-1", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", name: "narjis-1.jpg" },
          { key: "narjis-2", url: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80", name: "narjis-2.jpg" },
        ],
      }),
      await upsertProperty(ctx, {
        ownerType: "broker",
        ownerId: brokerOne,
        title: "شقة المستثمر في حطين",
        address: "حطين، الرياض",
        location: "الرياض",
        area: "حطين",
        description: "شقة واسعة مناسبة للمشتري الباحث عن سكن فاخر مع قابلية جيدة لإعادة البيع.",
        price: 1720000,
        beds: 4,
        baths: 4,
        sqft: 210,
        bankId: bankOne,
        publicationState: "published",
        media: [
          { key: "hittin-1", url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80", name: "hittin-1.jpg" },
        ],
      }),
      await upsertProperty(ctx, {
        ownerType: "broker",
        ownerId: brokerTwo,
        title: "شقة الواجهة البحرية",
        address: "أبحر، جدة",
        location: "جدة",
        area: "أبحر",
        description: "شقة بإطلالة مفتوحة مناسبة للشراء الأول مع خيار تمويل مريح.",
        price: 1180000,
        beds: 2,
        baths: 3,
        sqft: 154,
        bankId: bankTwo,
        publicationState: "published",
        media: [
          { key: "abhur-1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", name: "abhur-1.jpg" },
        ],
      }),
      await upsertProperty(ctx, {
        ownerType: "red",
        ownerId: redOne,
        title: "مسودة مشروع الورود",
        address: "الورود، الرياض",
        location: "الرياض",
        area: "الورود",
        description: "مشروع داخلي قيد التجهيز لاختبارات مساحة العمل فقط.",
        price: 990000,
        beds: 2,
        baths: 2,
        sqft: 132,
        publicationState: "draft",
        media: [
          { key: "draft-ward-1", url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80", name: "draft-ward-1.jpg" },
        ],
      }),
    ];

    const clientOne = await upsertCrmClient(ctx, {
      ownerAuthUserId: `seed-broker-${brokerOne}`,
      brokerId: brokerOne,
      name: "سارة عبد الله",
      phone: "+966500000301",
      email: "sara.demo@example.com",
      notes: "تبحث عن شقة 3 غرف في شمال الرياض مع تمويل مناسب.",
      now,
    });
    const clientTwo = await upsertCrmClient(ctx, {
      ownerAuthUserId: `seed-red-${redOne}`,
      REDId: redOne,
      name: "محمد خالد",
      phone: "+966500000302",
      email: "mohammed.demo@example.com",
      notes: "عميل جاد مهتم بالشراء والاستثمار مع مقارنة عروض البنوك.",
      now,
    });

    await upsertOrder(ctx, {
      userId: "seed-client-web-1",
      type: "property",
      propertyId: properties[0],
      REDId: redOne,
      intent: "client_web_property_search",
      notes: "أراد تفاصيل الشقة ثم طلب مقارنة تمويل.",
      sourceChannel: "web",
    });
    await upsertOrder(ctx, {
      userId: "seed-client-web-1",
      type: "loan",
      propertyId: properties[0],
      bankId: bankOne,
      REDId: redOne,
      intent: "client_web_loan_review",
      notes: "طلب حساب القسط الشهري وأفضل عرض بنكي للشقة.",
      sourceChannel: "web",
    });

    return {
      ok: true,
      brokers: 2,
      developers: 2,
      banks: 2,
      properties: properties.length,
      clients: [clientOne, clientTwo].length,
      orders: 2,
    };
  },
});

export const _ensureSaudiSeedBanks = internalMutation({
  args: {},
  returns: v.array(v.id("banks")),
  handler: async (ctx) => {
    return ensureSaudiSeedBanks(ctx as any);
  },
});

export const _seedSaudiOrganizationChunk = internalMutation({
  args: {
    batchLabel: v.string(),
    ownerType: v.union(v.literal("broker"), v.literal("red")),
    index: v.number(),
    isPlayground: v.optional(v.boolean()),
    playgroundOwnerEmail: v.optional(v.string()),
  },
  returns: v.object({
    organizationId: v.string(),
    ownerAuthUserId: v.string(),
    tenantOrgId: v.string(),
    isPlayground: v.boolean(),
    playgroundStatus: v.optional(v.union(v.literal("created"), v.literal("reused"))),
  }),
  handler: async (ctx, args) => {
    return seedSaudiOrganizationChunk({
      ctx: ctx as any,
      batchLabel: args.batchLabel,
      ownerType: args.ownerType,
      index: args.index,
      isPlayground: args.isPlayground,
      playgroundOwnerEmail: args.playgroundOwnerEmail,
    });
  },
});

export const _ensureSaudiPlaygroundNetwork = internalMutation({
  args: {
    batchLabel: v.string(),
    playgroundOwnerEmail: v.string(),
  },
  returns: v.object({
    playgroundOrganizationId: v.string(),
    playgroundStatus: v.union(v.literal("created"), v.literal("reused")),
  }),
  handler: async (ctx, args) => {
    return ensureSaudiPlaygroundNetwork(ctx as any, args);
  },
});

export const _buildSaudiSeedSummary = internalMutation({
  args: {
    batchLabel: v.string(),
    playgroundOwnerEmail: v.string(),
  },
  returns: v.object({
    batchLabel: v.string(),
    organizations: v.number(),
    developers: v.number(),
    brokers: v.number(),
    members: v.number(),
    properties: v.number(),
    crmClients: v.number(),
    deals: v.number(),
    offerPackages: v.number(),
    offerCases: v.number(),
    legacyOffers: v.number(),
    offers: v.number(),
    conversations: v.number(),
    messages: v.number(),
    banks: v.number(),
    bankProducts: v.number(),
    orders: v.number(),
    loanOrders: v.number(),
    propertyOrders: v.number(),
    publishedPropertiesWithBank: v.number(),
    playgroundOrganizationId: v.union(v.string(), v.null()),
    playgroundStatus: v.union(v.literal("created"), v.literal("reused")),
  }),
  handler: async (ctx, args) => {
    return buildSaudiSeedSummary(ctx as any, args);
  },
});

export const seedSaudiWorkspaceDataset: any = action({
  args: {
    playgroundOwnerEmail: v.string(),
    batchLabel: v.optional(v.string()),
    organizationCount: v.optional(v.number()),
  },
  returns: v.object({
    batchLabel: v.string(),
    organizations: v.number(),
    developers: v.number(),
    brokers: v.number(),
    members: v.number(),
    properties: v.number(),
    crmClients: v.number(),
    deals: v.number(),
    offerPackages: v.number(),
    offerCases: v.number(),
    legacyOffers: v.number(),
    offers: v.number(),
    conversations: v.number(),
    messages: v.number(),
    banks: v.number(),
    bankProducts: v.number(),
    orders: v.number(),
    loanOrders: v.number(),
    propertyOrders: v.number(),
    publishedPropertiesWithBank: v.number(),
    playgroundOrganizationId: v.union(v.string(), v.null()),
    playgroundStatus: v.union(v.literal("created"), v.literal("reused")),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{
    batchLabel: string;
    organizations: number;
    developers: number;
    brokers: number;
    members: number;
    properties: number;
    crmClients: number;
    deals: number;
    offerPackages: number;
    offerCases: number;
    legacyOffers: number;
    offers: number;
    conversations: number;
    messages: number;
    banks: number;
    bankProducts: number;
    orders: number;
    loanOrders: number;
    propertyOrders: number;
    publishedPropertiesWithBank: number;
    playgroundOrganizationId: string | null;
    playgroundStatus: "created" | "reused";
  }> => {
    const normalizedEmail = args.playgroundOwnerEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error("playgroundOwnerEmail is required");
    }
    const organizationCount = Math.max(2, Math.floor(args.organizationCount ?? 50));
    const batchLabel = args.batchLabel?.trim() || `saudi-seed-${Date.now()}`;

    await ctx.runMutation((internal as any).seed._ensureSaudiSeedBanks, {});

    const developerCount = Math.ceil(organizationCount / 2);
    const brokerCount = organizationCount - developerCount;

    const playgroundSeed: {
      organizationId: string;
      ownerAuthUserId: string;
      tenantOrgId: string;
      isPlayground: boolean;
      playgroundStatus?: "created" | "reused";
    } = await ctx.runMutation((internal as any).seed._seedSaudiOrganizationChunk, {
      batchLabel,
      ownerType: "red",
      index: 0,
      isPlayground: true,
      playgroundOwnerEmail: normalizedEmail,
    });

    for (let index = 0; index < developerCount - 1; index += 1) {
      await ctx.runMutation((internal as any).seed._seedSaudiOrganizationChunk, {
        batchLabel,
        ownerType: "red",
        index,
      });
    }

    for (let index = 0; index < brokerCount; index += 1) {
      await ctx.runMutation((internal as any).seed._seedSaudiOrganizationChunk, {
        batchLabel,
        ownerType: "broker",
        index,
      });
    }

    const playground: {
      playgroundOrganizationId: string;
      playgroundStatus: "created" | "reused";
    } = await ctx.runMutation((internal as any).seed._ensureSaudiPlaygroundNetwork, {
      batchLabel,
      playgroundOwnerEmail: normalizedEmail,
    });
    const summary: {
      batchLabel: string;
      organizations: number;
      developers: number;
      brokers: number;
      members: number;
      properties: number;
      crmClients: number;
      deals: number;
      offerPackages: number;
      offerCases: number;
      legacyOffers: number;
      offers: number;
      conversations: number;
      messages: number;
      banks: number;
      bankProducts: number;
      orders: number;
      loanOrders: number;
      propertyOrders: number;
      publishedPropertiesWithBank: number;
      playgroundOrganizationId: string | null;
      playgroundStatus: "created" | "reused";
    } = await ctx.runMutation((internal as any).seed._buildSaudiSeedSummary, {
      batchLabel,
      playgroundOwnerEmail: normalizedEmail,
    });

    return {
      ...summary,
      playgroundOrganizationId: playground.playgroundOrganizationId ?? summary.playgroundOrganizationId,
      playgroundStatus:
        playgroundSeed.playgroundStatus === "created" ? "created" : playground.playgroundStatus,
    };
  },
});

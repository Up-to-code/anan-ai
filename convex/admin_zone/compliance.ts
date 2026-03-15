import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";

const requirementValidator = v.object({
  id: v.string(),
  label: v.string(),
  required: v.boolean(),
  note: v.optional(v.string()),
});

const sourceValidator = v.object({
  id: v.string(),
  label: v.string(),
  url: v.string(),
});

const enforcementValidator = v.object({
  blockPublish: v.boolean(),
  hideUnverified: v.boolean(),
  showBanner: v.boolean(),
  requireOrgVerification: v.boolean(),
  requireListingVerification: v.boolean(),
  bannerTitle: v.optional(v.string()),
  bannerBody: v.optional(v.string()),
  bannerCtaLabel: v.optional(v.string()),
  bannerCtaHref: v.optional(v.string()),
});

const rulesetPayloadValidator = {
  countryCode: v.string(),
  countryLabel: v.optional(v.string()),
  orgType: v.union(v.literal("broker"), v.literal("red")),
  status: v.union(v.literal("active"), v.literal("draft"), v.literal("inactive")),
  requirements: v.array(requirementValidator),
  sources: v.array(sourceValidator),
  enforcement: enforcementValidator,
};

const DEFAULT_KSA_RULESETS: Array<{
  countryCode: string;
  countryLabel: string;
  orgType: "broker" | "red";
  requirements: Array<{ id: string; label: string; required: boolean; note?: string }>;
}> = [
  {
    countryCode: "SA",
    countryLabel: "المملكة العربية السعودية",
    orgType: "broker" as const,
    requirements: [
      {
        id: "broker-fal-license",
        label: "رخصة فال للوساطة العقارية",
        required: true,
        note: "المصدر الرسمي لخدمات الوساطة العقارية في السعودية.",
      },
      {
        id: "broker-cr",
        label: "سجل تجاري بنشاط وساطة عقارية",
        required: false,
        note: "مستند داعم شائع ضمن متطلبات الجهات التنظيمية.",
      },
      {
        id: "broker-identity",
        label: "هوية وطنية للمدير المسؤول أو المفوض",
        required: false,
        note: "مستند داعم لإثبات الصفة القانونية.",
      },
    ],
  },
  {
    countryCode: "SA",
    countryLabel: "المملكة العربية السعودية",
    orgType: "red" as const,
    requirements: [
      {
        id: "dev-cr",
        label: "سجل تجاري بنشاط التطوير العقاري",
        required: true,
        note: "يجب أن يطابق النشاط العقاري المسجل.",
      },
      {
        id: "dev-developer-certificate",
        label: "شهادة مطور عقاري (حسب الجهة المختصة)",
        required: true,
        note: "قد تطلبها جهات التأهيل حسب المنطقة.",
      },
      {
        id: "dev-wafi-license",
        label: "رخصة وافي للبيع على الخارطة (إن وجدت)",
        required: false,
        note: "عند تقديم مشاريع بيع على الخارطة.",
      },
      {
        id: "dev-zakat",
        label: "شهادة الزكاة والضريبة",
        required: false,
        note: "مستند داعم للامتثال المالي.",
      },
      {
        id: "dev-gosi",
        label: "شهادة التأمينات الاجتماعية (GOSI)",
        required: false,
        note: "قد يطلب لإثبات الالتزام بالموارد البشرية.",
      },
      {
        id: "dev-saudization",
        label: "شهادة نطاقات (نسبة التوطين)",
        required: false,
        note: "مستند داعم للامتثال للموارد البشرية.",
      },
      {
        id: "dev-chamber",
        label: "عضوية الغرفة التجارية",
        required: false,
        note: "مستند داعم شائع في الطلبات المؤسسية.",
      },
      {
        id: "dev-articles",
        label: "عقد التأسيس أو النظام الأساسي",
        required: false,
        note: "لإثبات هيكل الشركة وصلاحياتها.",
      },
    ],
  },
];

const DEFAULT_KSA_SOURCES = [
  {
    id: "rega-fal",
    label: "منصة فال للوساطة العقارية (هيئة العقار)",
    url: "https://rega.gov.sa/rega-services/platforms/fal-real-estate-brokerage/",
  },
  {
    id: "rcmc-qualification",
    label: "تأهيل المطور العقاري (RCMC)",
    url: "https://www.rcmc.gov.sa/developer-qualification",
  },
  {
    id: "balady-qualification",
    label: "تأهيل المطور العقاري (بلدي/إتمام)",
    url: "https://balady.gov.sa/ar/services/%D8%AA%D8%A3%D9%87%D9%8A%D9%84-%D8%A7%D9%84%D9%85%D8%B7%D9%88%D8%B1-%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A",
  },
] as const;

const DEFAULT_ENFORCEMENT = {
  blockPublish: true,
  hideUnverified: true,
  showBanner: true,
  requireOrgVerification: true,
  requireListingVerification: true,
  bannerTitle: "التوثيق مطلوب قبل النشر",
  bannerBody: "يرجى إكمال مستندات التحقق قبل نشر العقارات أو عرضها للعملاء.",
  bannerCtaLabel: "إكمال التوثيق",
  bannerCtaHref: "/ws?onboarding=verification",
};

async function deactivateOtherRulesets(ctx: any, args: { countryCode: string; orgType: "broker" | "red"; exceptId: any }) {
  const siblings = await ctx.db
    .query("complianceRulesets")
    .withIndex("country_org", (q: any) => q.eq("countryCode", args.countryCode).eq("orgType", args.orgType))
    .collect();
  await Promise.all(
    siblings
      .filter((item: any) => item._id !== args.exceptId && item.status === "active")
      .map((item: any) => ctx.db.patch(item._id, { status: "inactive", updatedAt: Date.now() })),
  );
}

/**
 * WHY:   Admins need a full list of compliance rulesets to manage activation and edits.
 * WHAT:  Returns all compliance rulesets sorted by last update.
 * HOW:   Enforces admin role and queries the complianceRulesets table.
 */
export const listComplianceRulesets = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    const rulesets = await ctx.db.query("complianceRulesets").collect();
    return rulesets.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  },
});

/**
 * WHY:   Admin edit screens need a single ruleset payload to load.
 * WHAT:  Fetches a compliance ruleset by id.
 * HOW:   Enforces admin role and returns the document from Convex.
 */
export const getComplianceRuleset = query({
  args: { id: v.id("complianceRulesets") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return ctx.db.get(args.id);
  },
});

/**
 * WHY:   Admins must create or update rulesets without redeploying enforcement logic.
 * WHAT:  Inserts or updates a compliance ruleset and bumps its version.
 * HOW:   Validates input, patches or inserts, and deactivates sibling active rulesets when needed.
 */
export const saveComplianceRuleset = mutation({
  args: {
    id: v.optional(v.id("complianceRulesets")),
    ...rulesetPayloadValidator,
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const now = Date.now();

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Ruleset not found" });
      }

      const nextVersion = (existing.version ?? 0) + 1;
      await ctx.db.patch(args.id, {
        countryCode: args.countryCode,
        countryLabel: args.countryLabel,
        orgType: args.orgType,
        status: args.status,
        requirements: args.requirements,
        sources: args.sources,
        enforcement: args.enforcement,
        version: nextVersion,
        updatedAt: now,
      });

      if (args.status === "active") {
        await deactivateOtherRulesets(ctx, {
          countryCode: args.countryCode,
          orgType: args.orgType,
          exceptId: args.id,
        });
      }

      return { ok: true, id: args.id, version: nextVersion };
    }

    const existingByCountry = await ctx.db
      .query("complianceRulesets")
      .withIndex("country_org", (q) => q.eq("countryCode", args.countryCode).eq("orgType", args.orgType))
      .collect();
    const maxVersion = existingByCountry.reduce((max, item) => Math.max(max, item.version ?? 0), 0);
    const version = maxVersion + 1;

    const id = await ctx.db.insert("complianceRulesets", {
      countryCode: args.countryCode,
      countryLabel: args.countryLabel,
      orgType: args.orgType,
      status: args.status,
      requirements: args.requirements,
      sources: args.sources,
      enforcement: args.enforcement,
      version,
      createdAt: now,
      updatedAt: now,
    });

    if (args.status === "active") {
      await deactivateOtherRulesets(ctx, {
        countryCode: args.countryCode,
        orgType: args.orgType,
        exceptId: id,
      });
    }

    return { ok: true, id, version };
  },
});

/**
 * WHY:   The platform needs a one-time KSA bootstrap so compliance works out of the box.
 * WHAT:  Inserts default KSA broker and RED rulesets if none exist.
 * HOW:   Admin-only mutation that checks for SA entries and inserts the seed payload once.
 */
export const seedDefaultComplianceRulesets = mutation({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    const existing = await ctx.db
      .query("complianceRulesets")
      .withIndex("countryCode", (q) => q.eq("countryCode", "SA"))
      .collect();

    if (existing.length > 0) {
      return { ok: true, inserted: 0 };
    }

    const now = Date.now();
    const inserts = await Promise.all(
      DEFAULT_KSA_RULESETS.map((ruleset) =>
        ctx.db.insert("complianceRulesets", {
          countryCode: ruleset.countryCode,
          countryLabel: ruleset.countryLabel,
          orgType: ruleset.orgType,
          status: "active",
          requirements: ruleset.requirements.map((req) => ({ ...req })),
          sources: [...DEFAULT_KSA_SOURCES],
          enforcement: DEFAULT_ENFORCEMENT,
          version: 1,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );

    return { ok: true, inserted: inserts.length };
  },
});

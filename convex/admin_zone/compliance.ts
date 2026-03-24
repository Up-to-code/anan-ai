import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { DEFAULT_ENFORCEMENT, DEFAULT_KSA_RULESETS, DEFAULT_KSA_SOURCES } from "./compliance/defaults";

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

type RulesetPayload = {
  countryCode: string;
  countryLabel?: string;
  orgType: "broker" | "red";
  status: "active" | "draft" | "inactive";
  requirements: Array<{ id: string; label: string; required: boolean; note?: string }>;
  sources: Array<{ id: string; label: string; url: string }>;
  enforcement: {
    blockPublish: boolean;
    hideUnverified: boolean;
    showBanner: boolean;
    requireOrgVerification: boolean;
    requireListingVerification: boolean;
    bannerTitle?: string;
    bannerBody?: string;
    bannerCtaLabel?: string;
    bannerCtaHref?: string;
  };
};

function toRulesetPayload(args: RulesetPayload) {
  return {
    countryCode: args.countryCode,
    countryLabel: args.countryLabel,
    orgType: args.orgType,
    status: args.status,
    requirements: args.requirements,
    sources: args.sources,
    enforcement: args.enforcement,
  } as const;
}

async function updateRuleset(ctx: any, args: RulesetPayload & { id: any }, now: number) {
  const existing = await ctx.db.get(args.id);
  if (!existing) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Ruleset not found" });
  }

  const version = (existing.version ?? 0) + 1;
  await ctx.db.patch(args.id, {
    ...toRulesetPayload(args),
    version,
    updatedAt: now,
  });
  return { id: args.id, version };
}

async function createRuleset(ctx: any, args: RulesetPayload, now: number) {
  const existingByCountry = await ctx.db
    .query("complianceRulesets")
    .withIndex("country_org", (q: any) => q.eq("countryCode", args.countryCode).eq("orgType", args.orgType))
    .collect();
  const maxVersion = existingByCountry.reduce((max: number, item: { version?: number }) => Math.max(max, item.version ?? 0), 0);
  const version = maxVersion + 1;
  const id = await ctx.db.insert("complianceRulesets", {
    ...toRulesetPayload(args),
    version,
    createdAt: now,
    updatedAt: now,
  });
  return { id, version };
}

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
    const result = args.id ? await updateRuleset(ctx, args as RulesetPayload & { id: any }, now) : await createRuleset(ctx, args, now);

    if (args.status === "active") {
      await deactivateOtherRulesets(ctx, {
        countryCode: args.countryCode,
        orgType: args.orgType,
        exceptId: result.id,
      });
    }

    return { ok: true, ...result };
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

import { query } from "../../_generated/server";
import { v } from "convex/values";
import { requireSession } from "../../_core/security/accessPolicy";
import { requireOrganizationMembership } from "../agencies/repositories/membership";
import { findActiveComplianceRuleset, resolveComplianceRulesetForOwner } from "./utils";

/**
 * WHY:   Onboarding and workspace compliance views need one ruleset by country and org type.
 * WHAT:  Returns the active compliance ruleset for the provided country/org combo.
 * HOW:   Requires a valid session and queries the ruleset index by country/org/status.
 */
export const getComplianceRulesetByCountry = query({
  args: {
    countryCode: v.string(),
    orgType: v.union(v.literal("broker"), v.literal("red")),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx);
    const ruleset = await findActiveComplianceRuleset(ctx, {
      countryCode: args.countryCode,
      orgType: args.orgType,
    });
    return ruleset ?? null;
  },
});

/**
 * WHY:   Workspace shells and onboarding flows need one active ruleset for the current org.
 * WHAT:  Returns the active compliance ruleset for the current organization context.
 * HOW:   Resolves the owner record, derives country/org type, and loads the active ruleset.
 */
export const getComplianceRulesetForCurrentOrg = query({
  args: {},
  handler: async (ctx) => {
    const { owner } = await requireOrganizationMembership(ctx);
    const { ruleset } = await resolveComplianceRulesetForOwner(ctx, owner);
    return ruleset ?? null;
  },
});

export { DEFAULT_COMPLIANCE_COUNTRY } from "./utils";

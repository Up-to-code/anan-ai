import { ConvexError } from "convex/values";
import { getOrganizationRecord } from "../agencies/repositories/core";
import type { AgenciesRepositoryCtx, OwnerContext } from "../agencies/repositories/core";

export const DEFAULT_COMPLIANCE_COUNTRY = "SA";

/**
 * WHY:   Compliance resolution needs a canonical org type value for ruleset lookup.
 * WHAT:  Normalizes the owner type into the ruleset org type.
 * HOW:   Maps broker owners to "broker" and everything else to "red".
 */
export function normalizeOrgType(ownerType: OwnerContext["ownerType"]) {
  return ownerType === "broker" ? "broker" as const : "red" as const;
}

/**
 * WHY:   Compliance rules require a country context even when org metadata is missing.
 * WHAT:  Resolves the org record and returns its country code with a default fallback.
 * HOW:   Loads the organization and falls back to DEFAULT_COMPLIANCE_COUNTRY when unset.
 */
export async function resolveOrganizationCountryCode(
  ctx: AgenciesRepositoryCtx,
  owner: OwnerContext,
) {
  const organization = await getOrganizationRecord(ctx, owner);
  if (!organization) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Organization not found" });
  }
  return {
    organization,
    countryCode: (organization as { countryCode?: string }).countryCode ?? DEFAULT_COMPLIANCE_COUNTRY,
  };
}

/**
 * WHY:   Multiple compliance ruleset versions can exist; runtime needs the active one.
 * WHAT:  Finds the active ruleset for a given country and org type.
 * HOW:   Queries the country/org/status index and returns the first match.
 */
export async function findActiveComplianceRuleset(
  ctx: AgenciesRepositoryCtx,
  args: { countryCode: string; orgType: "broker" | "red" },
) {
  return ctx.db
    .query("complianceRulesets")
    .withIndex("country_org_status", (q) =>
      q.eq("countryCode", args.countryCode).eq("orgType", args.orgType).eq("status", "active"),
    )
    .first();
}

/**
 * WHY:   Enforcement needs the ruleset plus the resolved org metadata in one call.
 * WHAT:  Returns the active ruleset and resolved country/org type for the owner.
 * HOW:   Resolves the organization country, normalizes org type, and loads the active ruleset.
 */
export async function resolveComplianceRulesetForOwner(
  ctx: AgenciesRepositoryCtx,
  owner: OwnerContext,
) {
  const { organization, countryCode } = await resolveOrganizationCountryCode(ctx, owner);
  const orgType = normalizeOrgType(owner.ownerType);
  const ruleset = await findActiveComplianceRuleset(ctx, { countryCode, orgType });
  return { ruleset, countryCode, orgType, organization };
}

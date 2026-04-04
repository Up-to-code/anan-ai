import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import type { ComplianceRuleset } from "@/server/contracts/compliance";
import { convexComplianceRepository, type ComplianceRepository } from "@/server/infrastructure/convex/compliance";

const DEFAULT_COMPLIANCE_COUNTRY = "SA";

type ComplianceServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  complianceRepository: ComplianceRepository;
};

const defaultDependencies: ComplianceServiceDependencies = {
  requireSession: requireSessionContext,
  complianceRepository: convexComplianceRepository,
};

/**
 * WHY:   Workspace pages need the compliance ruleset attached to the current org session.
 * WHAT:  Loads the active compliance ruleset for the authenticated organization.
 * HOW:   Resolves the session and delegates to the compliance repository.
 */
export async function getComplianceRulesetForCurrentOrg(
  dependencies: ComplianceServiceDependencies = defaultDependencies,
): Promise<ComplianceRuleset | null> {
  const session = await dependencies.requireSession();
  return dependencies.complianceRepository.getForCurrentOrg(session.token);
}

/**
 * WHY:   Onboarding flows need a ruleset even before an org record is finalized.
 * WHAT:  Fetches the active ruleset for a given org type and country, defaulting to KSA.
 * HOW:   Resolves the session then queries the repository with the country/org arguments.
 */
export async function getComplianceRulesetForOnboarding(
  orgType: "broker" | "red",
  countryCode: string = DEFAULT_COMPLIANCE_COUNTRY,
  dependencies: ComplianceServiceDependencies = defaultDependencies,
): Promise<ComplianceRuleset | null> {
  const session = await dependencies.requireSession();
  return dependencies.complianceRepository.getByCountryOrgType(session.token, { countryCode, orgType });
}

/**
 * WHY:   UI layers need a shared default compliance country without duplicating literals.
 * WHAT:  Exposes the default compliance country code used by the service layer.
 * HOW:   Re-exports the internal default string.
 */
export const DEFAULT_COMPLIANCE_COUNTRY_CODE = DEFAULT_COMPLIANCE_COUNTRY;

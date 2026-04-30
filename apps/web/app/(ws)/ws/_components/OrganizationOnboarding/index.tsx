import type { SessionUser } from "@/lib/serverSession";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import { GCC_COUNTRY_OPTIONS, type GccCountryCode } from "@/server/contracts/gccCountries";
import OrganizationOnboardingJourney from "./OrganizationOnboardingJourney";
import { getComplianceRulesetForOnboarding } from "@/server/domains/compliance/service";

type OrganizationOnboardingProps = {
  user: SessionUser;
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  incomingInvites: IncomingOrganizationInvite[];
  canCreateOrganization: boolean;
  organizationCreationDisabledReason?: string;
  errorMessage?: string;
  initialStep?: 1 | 2 | 3;
  initialOrganization?: { id: string; type: "broker" | "red"; countryCode?: GccCountryCode } | null;
};

/**
 * WHY:   The workspace needs one onboarding entrypoint when no organization exists.
 * WHAT:  Server wrapper that renders the client journey with injected data.
 * HOW:   Passes session-derived props to the journey stepper component.
 */
export default function OrganizationOnboarding(props: OrganizationOnboardingProps) {
  const brokerRulesetPromise = loadOnboardingRulesets("broker");
  const redRulesetPromise = loadOnboardingRulesets("red");
  return (
    <OrganizationOnboardingServerWrapper
      brokerRulesetPromise={brokerRulesetPromise}
      redRulesetPromise={redRulesetPromise}
      {...props}
    />
  );
}

async function OrganizationOnboardingServerWrapper(
  props: OrganizationOnboardingProps & {
    brokerRulesetPromise: Promise<Partial<Record<GccCountryCode, import("@/server/contracts/compliance").ComplianceRuleset | null>>>;
    redRulesetPromise: Promise<Partial<Record<GccCountryCode, import("@/server/contracts/compliance").ComplianceRuleset | null>>>;
  },
) {
  const { brokerRulesetPromise, redRulesetPromise, ...journeyProps } = props;
  const [brokerRulesetsByCountry, redRulesetsByCountry] = await Promise.all([
    brokerRulesetPromise,
    redRulesetPromise,
  ]);
  return (
    <div className="flex flex-col bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <OrganizationOnboardingJourney
          {...journeyProps}
          brokerRulesetsByCountry={brokerRulesetsByCountry}
          redRulesetsByCountry={redRulesetsByCountry}
        />
      </div>
    </div>
  );
}

async function loadOnboardingRulesets(orgType: "broker" | "red") {
  const rulesets = await Promise.all(
    GCC_COUNTRY_OPTIONS.map(async (country) => [
      country.code,
      await getComplianceRulesetForOnboarding(orgType, country.code),
    ] as const),
  );

  return Object.fromEntries(rulesets) as Partial<Record<GccCountryCode, import("@/server/contracts/compliance").ComplianceRuleset | null>>;
}

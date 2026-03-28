import type { SessionUser } from "@/lib/serverSession";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
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
  initialOrganization?: { id: string; type: "broker" | "red" } | null;
};

/**
 * WHY:   The workspace needs one onboarding entrypoint when no organization exists.
 * WHAT:  Server wrapper that renders the client journey with injected data.
 * HOW:   Passes session-derived props to the journey stepper component.
 */
export default function OrganizationOnboarding(props: OrganizationOnboardingProps) {
  const brokerRulesetPromise = getComplianceRulesetForOnboarding("broker");
  const redRulesetPromise = getComplianceRulesetForOnboarding("red");
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
    brokerRulesetPromise: Promise<import("@/server/contracts/compliance").ComplianceRuleset | null>;
    redRulesetPromise: Promise<import("@/server/contracts/compliance").ComplianceRuleset | null>;
  },
) {
  const { brokerRulesetPromise, redRulesetPromise, ...journeyProps } = props;
  const [brokerRuleset, redRuleset] = await Promise.all([
    brokerRulesetPromise,
    redRulesetPromise,
  ]);
  return (
    <div className="flex flex-col bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <OrganizationOnboardingJourney
          {...journeyProps}
          brokerRuleset={brokerRuleset}
          redRuleset={redRuleset}
        />
      </div>
    </div>
  );
}

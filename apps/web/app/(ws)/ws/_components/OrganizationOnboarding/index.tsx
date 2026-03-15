import type { SessionUser } from "@/lib/serverSession";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import OrganizationOnboardingJourney from "./OrganizationOnboardingJourney";

type OrganizationOnboardingProps = {
  user: SessionUser;
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  incomingInvites: IncomingOrganizationInvite[];
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
  return (
    <div className="flex flex-col bg-white text-slate-900">
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <OrganizationOnboardingJourney {...props} />
      </div>
    </div>
  );
}

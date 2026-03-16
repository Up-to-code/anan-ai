# Organization Onboarding

Journey-style onboarding for new workspace users without an organization.

## Structure
- `index.tsx`: Server orchestrator that injects data and renders the client journey.
- `OrganizationOnboardingJourney.tsx`: Client stepper controller.
- `OrganizationInvitesStep.tsx`: Step 1 (invites + path selection).
- `OrganizationDetailsStep.tsx`: Step 2 (org name + type creation).
- `VerificationDocsStep.tsx`: Step 3 (KSA requirements + document upload + submit).
- `OnboardingLogoutButton.tsx`: Local sign-out CTA for the onboarding flow.
- `requirements.ts`: Source-backed checklist data + helper filters.
- `organizationInvitesActions.ts`: Invite accept/decline helpers (API calls).

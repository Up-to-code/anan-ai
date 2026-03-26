"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/serverSession";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import OrganizationInvitesStep from "./OrganizationInvitesStep";
import OrganizationDetailsStep from "./OrganizationDetailsStep";
import VerificationDocsStep from "./VerificationDocsStep";
import OnboardingLogoutButton from "./OnboardingLogoutButton";
import type { ComplianceRuleset } from "@/server/contracts/compliance";
import type { RequirementItem, RequirementSourceLink } from "./requirements";

type OrganizationOnboardingJourneyProps = {
  user: SessionUser;
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  incomingInvites: IncomingOrganizationInvite[];
  canCreateOrganization: boolean;
  organizationCreationDisabledReason?: string;
  errorMessage?: string;
  initialStep?: 1 | 2 | 3;
  initialOrganization?: { id: string; type: "broker" | "red" } | null;
  brokerRuleset: ComplianceRuleset | null;
  redRuleset: ComplianceRuleset | null;
};

type OrganizationSnapshot = {
  id: string;
  type: "broker" | "red";
};

/**
 * WHY:   The Nexus onboarding journey needs to be simple, clean, and premium.
 * WHAT:  Modernizes the onboarding shell with rounded-3xl geometry and high-contrast typography.
 * HOW:   Replaces sharp borders with rounded surfaces and adopts a minimalist sidebar navigation.
 */
export default function OrganizationOnboardingJourney({
  user,
  suggestedOrganizationType,
  audience,
  incomingInvites,
  canCreateOrganization,
  organizationCreationDisabledReason,
  errorMessage,
  initialStep = 1,
  initialOrganization = null,
  brokerRuleset,
  redRuleset,
}: OrganizationOnboardingJourneyProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(
    !canCreateOrganization && initialStep === 2 ? 1 : initialStep,
  );
  const [organization, setOrganization] = useState<OrganizationSnapshot | null>(initialOrganization);
  const [pending, startTransition] = useTransition();
  const activeStep = !canCreateOrganization && step === 2 ? 1 : step;

  const steps = useMemo(
    () => [
      {
        id: 1,
        title: "الدعوات والمسار",
        description: "قبول الدعوة أو إنشاء جهة جديدة.",
      },
      {
        id: 2,
        title: "بيانات الجهة",
        description: "اسم الجهة ونوع النشاط.",
      },
      {
        id: 3,
        title: "التوثيق والمستندات",
        description: "رفع المستندات وإرسال الطلب.",
      },
    ],
    [],
  );

  const handleAdvance = (nextStep: 1 | 2 | 3) => {
    if (!canCreateOrganization && nextStep === 2) {
      setStep(1);
      return;
    }
    setStep(nextStep);
  };

  const handleOrganizationCreated = (snapshot: OrganizationSnapshot) => {
    setOrganization(snapshot);
    setStep(3);
    startTransition(() => {
      router.replace("/ws?onboarding=verification");
      router.refresh();
    });
  };

  const inferredType = organization?.type ?? suggestedOrganizationType;
  const activeRuleset = inferredType === "red" ? redRuleset : brokerRuleset;
  const currentRequirements = (activeRuleset?.requirements ?? []) as RequirementItem[];
  const currentSources = (activeRuleset?.sources ?? []) as RequirementSourceLink[];
  const countryLabel = activeRuleset?.countryLabel ?? null;
  const greetingName = user.name ?? user.email ?? "";
  const shouldShowGreeting = greetingName.trim().length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
        <div className="space-y-1.5">
          <div className="text-xl font-black tracking-tight text-slate-900">رحلة التفعيل</div>
          <p className="text-sm font-medium text-slate-500">
            {shouldShowGreeting ? `${greetingName}، ` : ""}
            خطوات بسيطة لتفعيل مساحة العمل بشكل احترافي.
          </p>
        </div>
        <OnboardingLogoutButton variant="ghost" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3">لماذا هذه الخطوات؟</div>
            <p className="text-[13px] leading-relaxed text-slate-500 font-medium">
              نرتّب إنشاء الجهة ودعوات الفريق والتوثيق حتى تبدأ العمل بثقة وبأقل وقت ممكن.
            </p>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col">
              {steps.map((item) => {
                const isActive = item.id === activeStep;
                const isLocked =
                  (item.id === 2 && !canCreateOrganization) || (item.id === 3 && !organization);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isLocked) return;
                      handleAdvance(item.id as 1 | 2 | 3);
                    }}
                    disabled={isLocked}
                    className={`flex items-start gap-4 px-6 py-5 text-right transition-all border-b border-slate-50 last:border-0 ${
                      isActive ? "bg-slate-50" : "hover:bg-slate-50/50"
                    } ${isLocked ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black transition-all ${
                        isActive 
                          ? "bg-slate-900 text-white" 
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.id}
                    </span>
                    <span className="space-y-1 mt-0.5">
                      <span className={`block text-[14px] font-black tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{item.title}</span>
                      <span className="block text-[12px] font-medium text-slate-400">{item.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-[40px] border border-slate-100 bg-white shadow-sm min-h-[500px] overflow-hidden">
          {errorMessage ? (
            <div className="bg-red-50 px-8 py-5 text-sm font-bold text-red-700 border-b border-red-100">
              {errorMessage}
            </div>
          ) : null}

          <div className="px-10 py-10">
            {activeStep === 1 ? (
              <OrganizationInvitesStep
                invites={incomingInvites}
                canCreateOrganization={canCreateOrganization}
                organizationCreationDisabledReason={organizationCreationDisabledReason}
                onCreateNew={() => handleAdvance(2)}
              />
            ) : null}

            {activeStep === 2 ? (
              <OrganizationDetailsStep
                suggestedOrganizationType={suggestedOrganizationType}
                audience={audience}
                pending={pending}
                onBack={() => handleAdvance(1)}
                onCreated={handleOrganizationCreated}
              />
            ) : null}

            {activeStep === 3 ? (
              <VerificationDocsStep
                organizationType={organization?.type ?? suggestedOrganizationType}
                requirements={currentRequirements}
                sources={currentSources}
                countryLabel={countryLabel}
                onBack={() => handleAdvance(canCreateOrganization ? 2 : 1)}
                onSkip={() => router.replace("/ws")}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/serverSession";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import OrganizationInvitesStep from "./OrganizationInvitesStep";
import OrganizationDetailsStep from "./OrganizationDetailsStep";
import VerificationDocsStep from "./VerificationDocsStep";
import {
  brokerRequirements,
  developerRequirements,
  requirementSources,
} from "./requirements";

type OrganizationOnboardingJourneyProps = {
  user: SessionUser;
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  incomingInvites: IncomingOrganizationInvite[];
  errorMessage?: string;
  initialStep?: 1 | 2 | 3;
  initialOrganization?: { id: string; type: "broker" | "red" } | null;
};

type OrganizationSnapshot = {
  id: string;
  type: "broker" | "red";
};

/**
 * WHY:   New users need a guided journey that keeps onboarding simple and professional.
 * WHAT:  Controls a 3-step onboarding flow for invites, org creation, and verification docs.
 * HOW:   Manages step state and renders the appropriate step component with shared context.
 */
export default function OrganizationOnboardingJourney({
  user,
  suggestedOrganizationType,
  audience,
  incomingInvites,
  errorMessage,
  initialStep = 1,
  initialOrganization = null,
}: OrganizationOnboardingJourneyProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(initialStep);
  const [organization, setOrganization] = useState<OrganizationSnapshot | null>(initialOrganization);
  const [pending, startTransition] = useTransition();

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

  const handleAdvance = (nextStep: 1 | 2 | 3) => setStep(nextStep);

  const handleOrganizationCreated = (snapshot: OrganizationSnapshot) => {
    setOrganization(snapshot);
    setStep(3);
    startTransition(() => {
      router.replace("/ws?onboarding=verification");
      router.refresh();
    });
  };

  const requirements = organization?.type === "red" ? developerRequirements : brokerRequirements;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-lg font-semibold text-slate-900">رحلة التفعيل</div>
        <p className="text-sm text-slate-600">
          {user.name ? `${user.name}، ` : ""}
          خطوات بسيطة لتفعيل مساحة العمل بشكل احترافي.
        </p>
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {steps.map((item) => {
              const isActive = item.id === step;
              const isLocked = item.id === 3 && !organization;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (isLocked) return;
                    handleAdvance(item.id as 1 | 2 | 3);
                  }}
                  disabled={isLocked}
                  className={`flex items-center gap-3 px-3 py-2 text-right transition ${
                    isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center border border-slate-300 text-xs font-semibold ${
                    isActive ? "bg-slate-900 text-white border-slate-900" : "bg-white"
                  }`}
                  >
                    {item.id}
                  </span>
                  <span className="space-y-1">
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="block text-xs">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage ? (
          <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="px-5 py-6">
          {step === 1 ? (
            <OrganizationInvitesStep
              invites={incomingInvites}
              onCreateNew={() => handleAdvance(2)}
            />
          ) : null}

          {step === 2 ? (
            <OrganizationDetailsStep
              suggestedOrganizationType={suggestedOrganizationType}
              audience={audience}
              pending={pending}
              onBack={() => handleAdvance(1)}
              onCreated={handleOrganizationCreated}
            />
          ) : null}

          {step === 3 ? (
            <VerificationDocsStep
              organizationType={organization?.type ?? suggestedOrganizationType}
              requirements={requirements}
              sources={requirementSources}
              onBack={() => handleAdvance(2)}
              onSkip={() => router.replace("/ws")}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

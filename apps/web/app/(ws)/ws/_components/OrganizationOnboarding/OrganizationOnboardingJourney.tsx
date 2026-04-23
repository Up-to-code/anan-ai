"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Compass, Lightbulb, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { SessionUser } from "@/lib/serverSession";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { IncomingOrganizationInvite } from "@/server/contracts/organizations";
import OrganizationInvitesStep from "./OrganizationInvitesStep";
import OrganizationDetailsStep from "./OrganizationDetailsStep";
import VerificationDocsStep from "./VerificationDocsStep";
import OnboardingLogoutButton from "./OnboardingLogoutButton";
import type { ComplianceRuleset } from "@/server/contracts/compliance";
import type { RequirementItem, RequirementSourceLink } from "./requirements";
import type { GccCountryCode } from "@/server/contracts/gccCountries";
import { MotionEffect, MotionEffects, OnboardingContentTransition } from "./OnboardingMotion";

type OrganizationOnboardingJourneyProps = {
  user: SessionUser;
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  incomingInvites: IncomingOrganizationInvite[];
  canCreateOrganization: boolean;
  organizationCreationDisabledReason?: string;
  errorMessage?: string;
  initialStep?: 1 | 2 | 3;
  initialOrganization?: { id: string; type: "broker" | "red"; countryCode?: GccCountryCode } | null;
  brokerRulesetsByCountry: Partial<Record<GccCountryCode, ComplianceRuleset | null>>;
  redRulesetsByCountry: Partial<Record<GccCountryCode, ComplianceRuleset | null>>;
};

type OrganizationSnapshot = {
  id: string;
  type: "broker" | "red";
  countryCode?: GccCountryCode;
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
  brokerRulesetsByCountry,
  redRulesetsByCountry,
}: OrganizationOnboardingJourneyProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(
    !canCreateOrganization && initialStep === 2 ? 1 : initialStep,
  );
  const [direction, setDirection] = useState(1);
  const [organization, setOrganization] = useState<OrganizationSnapshot | null>(initialOrganization);
  const [pending, startTransition] = useTransition();
  const activeStep = !canCreateOrganization && step === 2 ? 1 : step;

  const steps = useMemo(
    () => [
      {
        id: 1,
        title: "الدعوات والمسار",
        description: "قبول الدعوة أو إنشاء جهة جديدة.",
        tipTitle: "ابدأ بالطريق الأقصر",
        tipBody: "إذا كانت لديك دعوة جاهزة فقبولها يختصر التفعيل ويأخذك مباشرة إلى مساحة العمل دون إعداد إضافي.",
        icon: Compass,
      },
      {
        id: 2,
        title: "بيانات الجهة",
        description: "اسم الجهة ونوع النشاط.",
        tipTitle: "اضبط السوق من البداية",
        tipBody: "اختيار الدولة ثم نوع الجهة يضبط التوثيق والمسارات التشغيلية المناسبة لكل سوق خليجي بدون إعادة إدخال لاحقاً.",
        icon: Building2,
      },
      {
        id: 3,
        title: "التوثيق والمستندات",
        description: "رفع المستندات وإرسال الطلب.",
        tipTitle: "ابدأ بالحد الأدنى",
        tipBody: "يكفي مستند أساسي واحد للبدء. يمكنك استكمال الأدلة الداعمة لاحقاً من داخل المساحة بدون تعطيل التشغيل.",
        icon: ShieldCheck,
      },
    ],
    [],
  );

  const activeStepMeta = steps.find((item) => item.id === activeStep) ?? steps[0];
  const completionPercent = Math.round((activeStep / steps.length) * 100);

  const handleAdvance = (nextStep: 1 | 2 | 3) => {
    if (!canCreateOrganization && nextStep === 2) {
      setDirection(-1);
      setStep(1);
      return;
    }
    setDirection(nextStep >= activeStep ? 1 : -1);
    setStep(nextStep);
  };

  const handleOrganizationCreated = (snapshot: OrganizationSnapshot) => {
    setOrganization(snapshot);
    setDirection(1);
    setStep(3);
    startTransition(() => {
      router.replace("/ws?onboarding=verification");
      router.refresh();
    });
  };

  const inferredType = organization?.type ?? suggestedOrganizationType;
  const activeCountryCode = organization?.countryCode ?? initialOrganization?.countryCode ?? "SA";
  const activeRuleset =
    inferredType === "red"
      ? redRulesetsByCountry[activeCountryCode] ?? null
      : brokerRulesetsByCountry[activeCountryCode] ?? null;
  const currentRequirements = (activeRuleset?.requirements ?? []) as RequirementItem[];
  const currentSources = (activeRuleset?.sources ?? []) as RequirementSourceLink[];
  const countryLabel = activeRuleset?.countryLabel ?? null;
  const greetingName = user.name ?? user.email ?? "";
  const shouldShowGreeting = greetingName.trim().length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div className="flex justify-start">
        <OnboardingLogoutButton variant="ghost" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <MotionEffects className="order-2 space-y-4 lg:order-1" slide="up" zoom>
          {errorMessage ? (
            <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 px-6 py-4 text-sm font-bold text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 text-right">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                {`الخطوة ${activeStep} من ${steps.length}`}
              </div>
              <div className="mt-1 text-lg font-black tracking-tight text-foreground">
                {activeStepMeta.title}
              </div>
            </div>
            <div className="rounded-full border border-border bg-muted/40 px-3 py-1.5 text-[12px] font-black text-foreground">
              {completionPercent}%
            </div>
          </div>

          <div className="w-full">
            <OnboardingContentTransition activeKey={`step-${activeStep}`} direction={direction}>
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
                  initialCountryCode={activeCountryCode}
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
            </OnboardingContentTransition>
          </div>
        </MotionEffects>

        <MotionEffects className="order-1 space-y-4 lg:order-2" slide="down" zoom>
          <div className="space-y-2 text-right">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              {`الخطوة ${activeStep} من ${steps.length}`}
            </div>
            <div className="text-xl font-black tracking-tight text-foreground">رحلة التفعيل</div>
            <p className="text-sm font-medium leading-6 text-muted-foreground">
              {shouldShowGreeting ? `${greetingName}، ` : ""}
              خطوات بسيطة ومتصلة لتفعيل مساحة العمل بشكل احترافي.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {steps.map((item) => {
              const isActive = item.id === activeStep;
              const isLocked =
                (item.id === 2 && !canCreateOrganization) || (item.id === 3 && !organization);
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (isLocked) return;
                    handleAdvance(item.id as 1 | 2 | 3);
                  }}
                  disabled={isLocked}
                  className={`relative inline-flex h-10 items-center gap-2 overflow-hidden whitespace-nowrap rounded-full border px-3.5 text-right transition-all ${
                    isActive
                      ? "border-foreground/15 bg-card"
                      : "border-border bg-card/40 hover:border-foreground/20 hover:bg-card"
                  } ${isLocked ? "cursor-not-allowed opacity-45" : ""}`}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="onboarding-course-card"
                      className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.035),transparent_58%)]"
                      transition={{ type: "spring", stiffness: 380, damping: 36 }}
                    />
                  ) : null}
                  <div className="relative z-10 flex items-center gap-2">
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isActive ? "bg-foreground text-background" : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="h-2.5 w-2.5" />
                    </div>
                    <span className="truncate text-[11px] font-black tracking-tight text-foreground">
                      {item.title}
                    </span>
                    {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-foreground" /> : null}
                  </div>
                </button>
              );
            })}
          </div>

          <MotionEffect delay={0.06}>
            <div className="overflow-hidden rounded-[24px] border border-border/70 bg-[color:color-mix(in_srgb,var(--card)_78%,transparent)] p-3.5 shadow-[0_18px_48px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-card px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-foreground">
                <Lightbulb className="h-3.5 w-3.5" />
                Azaz Tips
              </div>
              <OnboardingContentTransition activeKey={`tip-${activeStep}`} direction={direction}>
                <div className="space-y-3 text-right">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                      تقدم الرحلة
                    </div>
                    <div className="text-[10px] font-black text-foreground">{completionPercent}%</div>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60">
                    <motion.div
                      className="h-full rounded-full bg-foreground"
                      animate={{ width: `${completionPercent}%` }}
                      transition={{ type: "spring", stiffness: 360, damping: 34 }}
                    />
                  </div>
                  <div className="pt-1">
                    <div className="text-[14px] font-black tracking-tight text-foreground">
                      {activeStepMeta.tipTitle}
                    </div>
                    <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-muted-foreground">
                      {activeStepMeta.tipBody}
                    </p>
                  </div>
                </div>
              </OnboardingContentTransition>
            </div>
          </MotionEffect>
        </MotionEffects>
      </div>
    </div>
  );
}

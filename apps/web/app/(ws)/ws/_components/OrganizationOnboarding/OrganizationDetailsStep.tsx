"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { GCC_COUNTRY_OPTIONS, type GccCountryCode } from "@/server/contracts/gccCountries";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import { MotionEffect, MotionEffects, OnboardingActionDock, OnboardingContentTransition } from "./OnboardingMotion";

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildOrganizationSlugCandidates(baseSlug: string) {
  const safeBase = baseSlug || `organization-${Math.random().toString(36).slice(2, 8)}`;
  return [
    safeBase,
    `${safeBase}-${Date.now().toString(36).slice(-4)}`,
    `${safeBase}-${Math.random().toString(36).slice(2, 6)}`,
  ];
}

function shouldRetryOrganizationCreate(message: string | null | undefined) {
  const normalized = (message ?? "").toLowerCase();
  return (
    normalized.includes("already exists") ||
    normalized.includes("duplicate") ||
    normalized.includes("slug") ||
    normalized.includes("unique")
  );
}

type OrganizationDetailsStepProps = {
  suggestedOrganizationType: "broker" | "red";
  audience: WorkspaceAudience;
  pending: boolean;
  initialCountryCode: GccCountryCode;
  onBack: () => void;
  onCreated: (snapshot: { id: string; type: "broker" | "red"; countryCode: GccCountryCode }) => void;
};

/**
 * WHY:   The organization creation step needs to feel premium and professional.
 * WHAT:  Modernizes the detail form with rounded-3xl geometry and high-contrast inputs.
 * HOW:   Adopts rounded-2xl for inputs and rounded-full for action buttons.
 */
export default function OrganizationDetailsStep({
  suggestedOrganizationType,
  audience,
  pending,
  initialCountryCode,
  onBack,
  onCreated,
}: OrganizationDetailsStepProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"broker" | "red">(suggestedOrganizationType);
  const [countryCode, setCountryCode] = useState<GccCountryCode>(initialCountryCode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCountry = useMemo(
    () => GCC_COUNTRY_OPTIONS.find((country) => country.code === countryCode) ?? GCC_COUNTRY_OPTIONS[0],
    [countryCode],
  );

  const helperText =
    audience === "developer"
      ? "اختر مطوراً لإدارة المشاريع والعروض."
      : audience === "broker"
        ? "اختر وسيطاً لإدارة العملاء والتعاون."
        : "اختر نوع الجهة لتفعيل المسارات المناسبة.";

  const typeTip =
    type === "red"
      ? "هذا المسار يهيئ الجهة لإدارة المشاريع والمخزون والعروض على مستوى المطور."
      : "هذا المسار يهيئ الجهة لإدارة العملاء والتفويضات والعروض على مستوى الوسيط.";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const trimmedName = name.trim();
      const fallbackSlug = slugifyOrganizationName(trimmedName);
      const slugCandidates = buildOrganizationSlugCandidates(fallbackSlug);

      let createdResult: Awaited<ReturnType<typeof authClient.organization.create>> | null = null;
      let lastCreateMessage: string | null = null;

      for (const candidateSlug of slugCandidates) {
        createdResult = await authClient.organization.create({
          name: trimmedName,
          slug: candidateSlug,
          metadata: {
            organizationType: type === "red" ? "developer" : "broker",
          },
        } as never);

        if (!createdResult.error) {
          break;
        }

        lastCreateMessage = createdResult.error.message ?? "تعذر إنشاء الجهة.";
        if (!shouldRetryOrganizationCreate(lastCreateMessage)) {
          throw new Error(lastCreateMessage ?? "تعذر إنشاء الجهة.");
        }
      }

      if (!createdResult || createdResult.error) {
        throw new Error(lastCreateMessage ?? createdResult?.error?.message ?? "تعذر إنشاء الجهة.");
      }
      const createdOrganization = createdResult.data as Record<string, unknown> | null;
      const organizationId =
        typeof createdOrganization?.id === "string" ? createdOrganization.id : null;
      const organizationSlug =
        typeof createdOrganization?.slug === "string" && createdOrganization.slug.trim().length > 0
          ? createdOrganization.slug
          : fallbackSlug;

      if (!organizationId) {
        throw new Error("تم إنشاء الجهة لكن تعذر قراءة بياناتها.");
      }

      const activeResult = await authClient.organization.setActive({
        organizationId,
      } as never);
      if (activeResult.error) {
        throw new Error(activeResult.error.message ?? "تعذر تفعيل الجهة.");
      }

      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          name: trimmedName,
          slug: organizationSlug,
          type,
          countryCode,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "تعذر إنشاء الجهة.");
      }

      const organization = await response.json() as { id: string; type: "broker" | "red"; countryCode?: GccCountryCode };
      onCreated({ id: organization.id, type: organization.type, countryCode: organization.countryCode ?? countryCode });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر إنشاء الجهة.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mx-auto max-w-2xl space-y-7" onSubmit={handleSubmit}>
      <MotionEffects className="space-y-6" slide="up" zoom>
        <div className="space-y-2 text-right">
          <div className="text-xl font-black tracking-tight text-foreground">بيانات الجهة</div>
          <p className="text-sm font-medium text-muted-foreground">{helperText}</p>
        </div>

        <div className="flex flex-col gap-3 text-right">
          <label className="text-xs font-black uppercase tracking-widest text-foreground">اسم الجهة</label>
          <input
            data-testid="onboarding-organization-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="مثال: مؤسسة عنان العقارية"
            className="w-full rounded-2xl border border-border bg-muted/30 px-5 py-4 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-ring focus:bg-background"
          />
        </div>

        <div className="space-y-3 text-right">
          <div className="text-xs font-black uppercase tracking-widest text-foreground">دولة التشغيل</div>
          <div
            role="radiogroup"
            aria-label="دولة التشغيل"
            className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3"
          >
            {GCC_COUNTRY_OPTIONS.map((country) => {
              const isSelected = countryCode === country.code;
              return (
                <motion.button
                  key={country.code}
                  type="button"
                  role="radio"
                  data-testid={`onboarding-country-${country.code}`}
                  aria-checked={isSelected}
                  onClick={() => setCountryCode(country.code as GccCountryCode)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  className={`flex min-h-[76px] items-start gap-3 rounded-[24px] border-2 p-3.5 text-right transition-all ${
                    isSelected
                      ? "border-foreground bg-card shadow-sm"
                      : "border-border bg-muted/30 hover:bg-background"
                  }`}
                >
                  <motion.div
                    animate={{
                      borderColor: isSelected ? "var(--foreground)" : "var(--border)",
                      backgroundColor: isSelected ? "var(--foreground)" : "var(--background)",
                    }}
                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                    transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  >
                    {isSelected ? (
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-white"
                        initial={{ scale: 0.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.18 }}
                      />
                    ) : null}
                  </motion.div>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="block text-[14px] font-black leading-tight text-foreground">
                      {country.label}
                    </span>
                    <span className="block text-[11px] font-bold tracking-[0.18em] text-muted-foreground">
                      {country.code}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
          <p className="text-[12px] font-medium text-muted-foreground">
            نحدد الدولة من البداية حتى نفعّل متطلبات التوثيق ومسارات السوق المناسبة داخل دول الخليج.
          </p>
        </div>

        <div className="space-y-3 text-right">
          <div className="text-xs font-black uppercase tracking-widest text-foreground">نوع الجهة</div>
          <div className="grid gap-3 md:grid-cols-2">
            <motion.button
              type="button"
              data-testid="onboarding-org-type-broker"
              onClick={() => setType("broker")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              className={`flex items-start gap-4 rounded-[24px] border-2 p-4 text-right transition-all ${
                type === "broker"
                  ? "border-foreground bg-card"
                  : "border-border bg-muted/30 hover:bg-background"
              }`}
            >
              <motion.div
                animate={{
                  borderColor: type === "broker" ? "var(--foreground)" : "var(--border)",
                  backgroundColor: type === "broker" ? "var(--foreground)" : "var(--background)",
                }}
                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
              >
                {type === "broker" ? <div className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
              </motion.div>
              <span className="space-y-1">
                <span className="block text-[15px] font-black text-foreground">وسيط عقاري</span>
                <span className="block text-[12px] font-medium text-muted-foreground">إدارة العملاء والعروض.</span>
              </span>
            </motion.button>

            <motion.button
              type="button"
              data-testid="onboarding-org-type-developer"
              onClick={() => setType("red")}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              className={`flex items-start gap-4 rounded-[24px] border-2 p-4 text-right transition-all ${
                type === "red"
                  ? "border-foreground bg-card"
                  : "border-border bg-muted/30 hover:bg-background"
              }`}
            >
              <motion.div
                animate={{
                  borderColor: type === "red" ? "var(--foreground)" : "var(--border)",
                  backgroundColor: type === "red" ? "var(--foreground)" : "var(--background)",
                }}
                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
              >
                {type === "red" ? <div className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
              </motion.div>
              <span className="space-y-1">
                <span className="block text-[15px] font-black text-foreground">مطور عقاري</span>
                <span className="block text-[12px] font-medium text-muted-foreground">إدارة المشاريع والعروض.</span>
              </span>
            </motion.button>
          </div>
        </div>

        <MotionEffect>
          <div className="overflow-hidden rounded-[24px] border border-border bg-muted/20 p-4">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Azaz Tips
            </div>
            <OnboardingContentTransition activeKey={`${countryCode}-${type}`} direction={1}>
              <div className="space-y-2 text-right">
                <div className="text-[15px] font-black tracking-tight text-foreground">
                  {selectedCountry.label}
                </div>
                <p className="text-[13px] font-medium leading-relaxed text-muted-foreground">
                  {typeTip}
                </p>
                <p className="text-[12px] font-medium leading-relaxed text-muted-foreground">
                  سنبني لك مسار التوثيق الافتراضي ومتطلبات الانطلاق الأولية وفق سوق {selectedCountry.label}.
                </p>
              </div>
            </OnboardingContentTransition>
          </div>
        </MotionEffect>
      </MotionEffects>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-[13px] font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <OnboardingActionDock>
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            data-testid="onboarding-details-back"
            onClick={onBack}
            className="rounded-full bg-muted px-8 py-3.5 text-xs font-black uppercase tracking-widest text-foreground transition hover:bg-muted/80"
          >
            رجوع
          </button>
          <button
            type="submit"
            data-testid="onboarding-details-submit"
            disabled={pending || isSubmitting}
            className="rounded-full bg-foreground px-10 py-3.5 text-xs font-black uppercase tracking-widest text-background transition hover:bg-foreground/90 disabled:opacity-50"
          >
            {isSubmitting ? "جارٍ الحفظ..." : "متابعة"}
          </button>
        </div>
      </OnboardingActionDock>
    </form>
  );
}

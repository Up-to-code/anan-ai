"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { ComplianceBanner } from "../_lib/complianceBanner";

/**
 * WHY:   Workspace verification messaging should feel native to the shared shell across every zone instead of each layout inventing its own warning card.
 * WHAT:  Renders the shared compliance banner payload with centered shell alignment, RTL-safe layout, and token-based workspace styling.
 * HOW:   Uses a wide content rail for consistent placement, keeps amber as an accent rather than the whole surface, and stacks the CTA on narrow screens.
 */
export default function WorkspaceComplianceBanner({
  banner,
}: {
  banner: ComplianceBanner;
}) {
  const { direction, isRtl } = useWebLocale();

  return (
    <div
      data-slot="workspace-compliance-banner-rail"
      className="px-4 pt-4 sm:px-6 lg:px-8 xl:px-10"
      dir={direction}
    >
      <div className="mx-auto w-full max-w-6xl">
        <section
          data-slot="workspace-compliance-banner"
          className="mx-auto w-full max-w-4xl rounded-[26px] border border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--workspace-panel)_96%,transparent)_0%,color-mix(in_srgb,var(--workspace-elevated)_98%,transparent)_100%)] px-4 py-4 shadow-[0_20px_46px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-5"
        >
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-5">
            <div className={cn("min-w-0 w-full", isRtl ? "text-right" : "text-left")}>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-[11px] font-black text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/12 dark:text-amber-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/12 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
                <span>{banner.title}</span>
              </div>
              <p className="mt-3 text-[13px] font-semibold leading-6 text-[color:color-mix(in_srgb,var(--workspace-bubble-other-foreground)_78%,transparent)]">
                {banner.body}
              </p>
            </div>

            {banner.ctaLabel ? (
              <a
                data-slot="workspace-compliance-banner-action"
                href={banner.ctaHref ?? "/ws?onboarding=verification"}
                className="inline-flex w-full shrink-0 items-center justify-center rounded-2xl border border-amber-400/24 bg-[color:color-mix(in_srgb,var(--workspace-panel)_94%,transparent)] px-4 py-3 text-[12px] font-black tracking-[0.12em] text-amber-900 transition hover:border-amber-300/34 hover:bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] hover:text-amber-950 dark:text-amber-200 dark:hover:text-amber-100 lg:w-auto lg:min-w-[11rem] lg:flex-none"
              >
                {banner.ctaLabel}
              </a>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

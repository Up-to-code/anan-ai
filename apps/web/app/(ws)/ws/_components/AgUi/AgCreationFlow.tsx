"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const expertStepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 64 : -64,
    opacity: 0,
    scale: 0.97,
    filter: "blur(5px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -64 : 64,
    opacity: 0,
    scale: 0.97,
    filter: "blur(5px)",
  }),
};

export const expertStaggerContainer: Variants = {
  center: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
};

export const expertStaggerItem: Variants = {
  enter: { opacity: 0, y: 16, filter: "blur(4px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export type CreationFlowStep = {
  key: string;
  title: string;
  summary: string;
};

/**
 * WHY:   Project and unit creation should feel like one expert-guided product surface.
 * WHAT:  Renders a shared progress header for creation wizards.
 * HOW:   Uses stable dimensions and the same spring progress animation across both forms.
 */
export function CreationFlowProgress({
  steps,
  currentStepIndex,
  onStepChange,
}: {
  steps: CreationFlowStep[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}) {
  const activeStep = steps[currentStepIndex] ?? steps[0];
  const completionPercent = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <section className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 lg:p-5">
      <div className="text-right">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-foreground">
              الخطوة {currentStepIndex + 1} من {steps.length}
            </div>
            <div className="mt-1 text-xl font-black text-foreground">{activeStep.title}</div>
          </div>
          <div className="rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-1.5 text-[12px] font-bold text-[var(--workspace-muted)]">
            {Math.round(completionPercent)}%
          </div>
        </div>
        <div className="mt-2 text-sm leading-7 text-[var(--workspace-muted)]">{activeStep.summary}</div>
        <div className="mt-4 h-2 rounded-full bg-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)]">
          <motion.div
            className="h-full rounded-full bg-[var(--workspace-highlight)]"
            animate={{ width: `${completionPercent}%` }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepChange(index)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold transition",
                isActive
                  ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_22%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-foreground"
                  : isCompleted
                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black",
                  isActive ? "bg-foreground text-background" : isCompleted ? "bg-emerald-600 text-white" : "bg-[var(--workspace-panel)] text-[var(--workspace-muted)]",
                )}
              >
                {index + 1}
              </span>
              <span>{step.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * WHY:   Both creation flows need identical step transition behavior.
 * WHAT:  Animates exactly one active step in and out.
 * HOW:   Wraps AnimatePresence with the shared expert variants.
 */
export function CreationFlowMotionStep({
  stepKey,
  direction,
  children,
}: {
  stepKey: string;
  direction: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={stepKey}
        custom={direction}
        variants={expertStepVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * WHY:   Navigation controls should behave identically across project and unit creation.
 * WHAT:  Renders the shared back/next/save action bar.
 * HOW:   Receives caller-owned handlers so validation remains local to each form.
 */
export function CreationFlowActions({
  isFirstStep,
  isLastStep,
  allowFirstBack = false,
  pending,
  previousLabel,
  nextLabel,
  saveLabel,
  savingLabel,
  onBack,
  onNext,
  onSave,
}: {
  isFirstStep: boolean;
  isLastStep: boolean;
  allowFirstBack?: boolean;
  pending: boolean;
  previousLabel: string;
  nextLabel: string;
  saveLabel: string;
  savingLabel: string;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
}) {
  return (
    <section className="sticky bottom-4 z-10 rounded-[22px] border border-[color:var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,transparent)] p-4 shadow-lg backdrop-blur md:p-5">
      <div className="flex items-center justify-between gap-6">
        <button
          type="button"
          onClick={onBack}
          disabled={(isFirstStep && !allowFirstBack) || pending}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-6 py-3 text-[13px] font-black text-foreground transition-all hover:bg-[var(--workspace-accent-soft)] active:scale-95 disabled:pointer-events-none disabled:opacity-30"
        >
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          {previousLabel}
        </button>

        <button
          type="button"
          onClick={isLastStep ? onSave : onNext}
          disabled={pending}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-8 py-3 text-[13px] font-black text-background shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
        >
          {isLastStep ? (pending ? savingLabel : saveLabel) : nextLabel}
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </button>
      </div>
    </section>
  );
}

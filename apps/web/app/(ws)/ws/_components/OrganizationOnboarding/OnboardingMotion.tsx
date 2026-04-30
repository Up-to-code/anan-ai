"use client";

import { Children, isValidElement } from "react";
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

type MotionEffectProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  slide?: "up" | "down" | "left" | "right" | false;
  blur?: boolean;
  zoom?: boolean;
};

type MotionEffectsProps = MotionEffectProps & {
  stagger?: number;
};

const easing: [number, number, number, number] = [0.22, 1, 0.36, 1];

function resolveOffset(slide: MotionEffectProps["slide"]) {
  switch (slide) {
    case "down":
      return { x: 0, y: -18 };
    case "left":
      return { x: 18, y: 0 };
    case "right":
      return { x: -18, y: 0 };
    case "up":
      return { x: 0, y: 18 };
    default:
      return { x: 0, y: 0 };
  }
}

/**
 * WHY:   Animate UI is copy-first, so we keep the motion recipe local and adaptable.
 * WHAT:  Provides a small reveal primitive inspired by Animate UI's Effect component.
 * HOW:   Uses Motion with gentle blur/slide/zoom defaults and respects reduced motion.
 */
export function MotionEffect({
  children,
  className,
  delay = 0,
  slide = "up",
  blur = true,
  zoom = false,
}: MotionEffectProps) {
  const reduceMotion = useReducedMotion();
  const offset = reduceMotion ? { x: 0, y: 0 } : resolveOffset(slide);

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: offset.x,
        y: offset.y,
        scale: reduceMotion || !zoom ? 1 : 0.985,
        filter: reduceMotion || !blur ? "blur(0px)" : "blur(8px)",
      }}
      animate={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.45,
        delay,
        ease: easing,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * WHY:   The onboarding journey benefits from a calm stagger rather than abrupt content pops.
 * WHAT:  Staggers sibling sections using the same reveal recipe.
 * HOW:   Wraps each valid child with MotionEffect while preserving the container's layout.
 */
export function MotionEffects({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  slide = "up",
  blur = true,
  zoom = false,
}: MotionEffectsProps) {
  return (
    <div className={className}>
      {Children.map(children, (child, index) => {
        if (!isValidElement(child)) return child;
        return (
          <MotionEffect
            key={child.key ?? index}
            delay={delay + index * stagger}
            slide={slide}
            blur={blur}
            zoom={zoom}
          >
            {child}
          </MotionEffect>
        );
      })}
    </div>
  );
}

export const onboardingStepVariants: Variants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 44 : -44,
    opacity: 0,
    scale: 0.985,
    filter: "blur(10px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? -32 : 32,
    opacity: 0,
    scale: 0.99,
    filter: "blur(8px)",
  }),
};

export const onboardingStepTransition: Transition = {
  duration: 0.42,
  ease: easing,
};

type OnboardingContentTransitionProps = {
  activeKey: string | number;
  direction: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * WHY:   Step changes should feel directional and legible.
 * WHAT:  Animates exactly one active onboarding panel at a time.
 * HOW:   Uses AnimatePresence with shared motion variants for enter/exit transitions.
 */
export function OnboardingContentTransition({
  activeKey,
  direction,
  className,
  children,
}: OnboardingContentTransitionProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="wait" custom={direction}>
      <motion.div
        key={activeKey}
        custom={direction}
        className={cn(className)}
        variants={reduceMotion ? undefined : onboardingStepVariants}
        initial={reduceMotion ? { opacity: 0 } : "enter"}
        animate={reduceMotion ? { opacity: 1 } : "center"}
        exit={reduceMotion ? { opacity: 0 } : "exit"}
        transition={reduceMotion ? { duration: 0.18 } : onboardingStepTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function OnboardingActionDock({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-4 z-20 mt-8 rounded-[28px] border border-white/60 bg-[color:color-mix(in_srgb,white_72%,transparent)] p-3 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,white_58%,transparent)] dark:border-white/10 dark:bg-[color:color-mix(in_srgb,var(--card)_66%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

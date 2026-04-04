"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ChartOverlay, ConnectionOverlay } from "./LandingMotionOverlays";

type MotionVectorProps = {
  src: string;
  alt: string;
  dark?: boolean;
  width?: number;
  height?: number;
  className?: string;
  overlay?: ReactNode;
};

const HERO_NETWORK_LINES = [
  { x1: 360, y1: 260, x2: 600, y2: 260, color: "#2563EB", duration: 4.2 },
  { x1: 360, y1: 260, x2: 120, y2: 260, color: "#2563EB", duration: 4.2, delay: 0.3 },
  { x1: 360, y1: 260, x2: 520, y2: 100, color: "#60A5FA", duration: 4.8, delay: 0.5 },
  { x1: 360, y1: 260, x2: 200, y2: 420, color: "#94A3B8", duration: 5.2, delay: 0.7 },
];

const CONVERGENCE_LINES = [
  { x1: 310, y1: 260, x2: 500, y2: 370, color: "#2563EB", duration: 4.2 },
  { x1: 310, y1: 260, x2: 120, y2: 150, color: "#2563EB", duration: 4.2, delay: 0.28 },
  { x1: 310, y1: 260, x2: 310, y2: 60, color: "#60A5FA", duration: 4.6, delay: 0.54 },
  { x1: 310, y1: 260, x2: 120, y2: 370, color: "#CBD5E1", duration: 5.1, delay: 0.78 },
];

function CenterBrandMark({
  reduceMotion,
  size,
  wrapperClassName,
  borderClassName,
}: {
  reduceMotion: boolean | null;
  size: number;
  wrapperClassName: string;
  borderClassName: string;
}) {
  return (
    <motion.div
      className={wrapperClassName}
      animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduceMotion ? undefined : { scale: 1.04 }}
    >
      <div className={borderClassName}>
        <Image src="/brand-logo.svg" alt="Anan" width={size} height={size} style={{ width: size, height: size }} priority />
      </div>
    </motion.div>
  );
}

/**
 * WHY:   The landing page still needs motion affordances after moving to file-based SVG illustrations.
 * WHAT:  Provides thin hover and loop wrappers around static vector assets.
 * HOW:   Uses motion containers around `next/image` instead of animating illustration geometry directly.
 */
function MotionVector({
  src,
  alt,
  dark,
  width = 520,
  height = 420,
  className,
  overlay,
}: MotionVectorProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`relative mx-4 overflow-hidden rounded-lg border p-6 md:mx-8 md:p-8 ${dark ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"} ${className ?? ""}`}
      initial={{ opacity: 0.96 }}
      animate={reduceMotion ? undefined : { y: [0, -3, 0], opacity: [0.98, 1, 0.98] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduceMotion ? undefined : { scale: 1.01, y: -2 }}
    >
      <Image src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
      {overlay ? <div className="pointer-events-none absolute inset-0">{overlay}</div> : null}
    </motion.div>
  );
}

function HeroNetworkCanvas({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      className="w-full"
      animate={reduceMotion ? undefined : { opacity: [0.94, 1, 0.94], y: [0, -4, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
    >
      <Image
        src="/vectors/landing/anan_landing_hero_brand_v2.svg"
        alt="شبكة عنان"
        width={680}
        height={500}
        className="h-auto w-full"
        priority
      />
      <div className="pointer-events-none absolute inset-0">
        <ConnectionOverlay
          viewBoxWidth={720}
          viewBoxHeight={520}
          lines={HERO_NETWORK_LINES}
        />
      </div>
    </motion.div>
  );
}

/**
 * Hero focal visual with network signals and a centered brand mark.
 */
export function HeroBrandNetworkVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto mt-4 flex w-full max-w-[680px] items-center justify-center px-4 md:px-8">
      <HeroNetworkCanvas reduceMotion={reduceMotion} />

      <CenterBrandMark
        reduceMotion={reduceMotion}
        size={104}
        wrapperClassName="absolute inset-0 flex items-center justify-center"
        borderClassName="rounded-lg border border-slate-200 bg-white/96 p-4 dark:border-slate-700 dark:bg-slate-950/90"
      />
    </div>
  );
}

/**
 * WHY:   The landing page needs a distinct explanatory visual to anchor the overview section.
 * WHAT:  Displays the buyer-intelligence vector with animated connection lines.
 * HOW:   Wraps the static SVG in MotionVector with a ConnectionOverlay.
 */
export function BuyerIntelligenceVisual() {
  return (
    <MotionVector
      src="/vectors/landing/anan_landing_buyers_flow_v3.svg"
      alt="مسار التعريف بالمنصة"
      overlay={
        <ConnectionOverlay
          viewBoxWidth={520}
          viewBoxHeight={420}
          lines={[
            { x1: 180, y1: 210, x2: 240, y2: 210, color: "#2563EB", duration: 2.8 },
            { x1: 280, y1: 210, x2: 340, y2: 210, color: "#60A5FA", duration: 2.8, delay: 0.35 },
          ]}
        />
      }
    />
  );
}

/**
 * WHY:   Developer sections need a darker, data-forward visual identity.
 * WHAT:  Shows the developer pulse vector with chart-style overlay motion.
 * HOW:   Uses MotionVector in dark mode and layers the chart overlay.
 */
export function DeveloperPulseVisual() {
  return (
    <MotionVector
      src="/vectors/landing/anan_landing_developer_pulse_v3.svg"
      alt="إشارات الطلب للمطور"
      dark
      overlay={<ChartOverlay />}
    />
  );
}

/**
 * WHY:   The broker section requires a network visual that signals collaboration.
 * WHAT:  Renders the broker network illustration with moving signal paths.
 * HOW:   Uses MotionVector and ConnectionOverlay with tuned line timings.
 */
export function BrokerNetworkVisual() {
  return (
    <MotionVector
      src="/vectors/landing/anan_landing_broker_network_v2.svg"
      alt="شبكة الربط بين الوسطاء"
      overlay={
        <ConnectionOverlay
          viewBoxWidth={520}
          viewBoxHeight={420}
          lines={[
            { x1: 120, y1: 110, x2: 200, y2: 160, color: "#94A3B8", duration: 3.8 },
            { x1: 320, y1: 140, x2: 400, y2: 110, color: "#2563EB", duration: 3.8, delay: 0.24 },
            { x1: 340, y1: 320, x2: 400, y2: 290, color: "#94A3B8", duration: 4.2, delay: 0.5 },
            { x1: 120, y1: 290, x2: 160, y2: 290, color: "#2563EB", duration: 3.2, delay: 0.68 },
          ]}
        />
      }
    />
  );
}

/**
 * WHY:   The convergence section needs a single, central symbol of market unification.
 * WHAT:  Displays the convergence field illustration with pulsing center mark.
 * HOW:   Combines MotionVector-like animation with a layered brand mark core.
 */
export function ConvergenceFieldVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative flex items-center justify-center px-4 py-10 md:px-8"
      animate={reduceMotion ? undefined : { y: [0, -3, 0], opacity: [0.96, 1, 0.96] }}
      transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      whileHover={reduceMotion ? undefined : { scale: 1.01 }}
    >
      <div className="relative w-full max-w-[620px]">
        <Image
          src="/vectors/landing/anan_landing_convergence_v3.svg"
          alt="نقطة التقاء السوق"
          width={620}
          height={520}
          className="h-auto w-full"
        />
        <div className="pointer-events-none absolute inset-0">
          <ConnectionOverlay
            viewBoxWidth={620}
            viewBoxHeight={520}
            lines={CONVERGENCE_LINES}
          />
        </div>
        <CenterBrandMark
          reduceMotion={reduceMotion}
          size={72}
          wrapperClassName="pointer-events-none absolute inset-0 flex items-center justify-center"
          borderClassName="border border-slate-200 bg-white/96 p-3"
        />
      </div>
    </motion.div>
  );
}

/**
 * WHY:   The AI section needs a dedicated visual to reinforce the intelligence layer.
 * WHAT:  Shows the AI intelligence vector with animated network lines.
 * HOW:   Uses MotionVector with ConnectionOverlay for subtle motion.
 */
export function AiIntelligenceVisual() {
  return (
    <MotionVector
      src="/vectors/landing/anan_landing_ai_intelligence_v3.svg"
      alt="ذكاء عنان"
      overlay={
        <ConnectionOverlay
          viewBoxWidth={520}
          viewBoxHeight={420}
          lines={[
            { x1: 200, y1: 150, x2: 120, y2: 70, color: "#2563EB", duration: 3.4 },
            { x1: 320, y1: 150, x2: 400, y2: 70, color: "#60A5FA", duration: 3.4, delay: 0.22 },
            { x1: 200, y1: 270, x2: 120, y2: 350, color: "#2563EB", duration: 3.8, delay: 0.44 },
            { x1: 320, y1: 270, x2: 400, y2: 350, color: "#94A3B8", duration: 3.8, delay: 0.66 },
          ]}
        />
      }
    />
  );
}

/**
 * WHY:   The ecosystem section must show cross-party connectivity at a glance.
 * WHAT:  Renders the ecosystem connection vector with animated signal lines.
 * HOW:   Composes MotionVector with ConnectionOverlay line animation.
 */
export function EcosystemConnectionVisual() {
  return (
    <MotionVector
      src="/vectors/landing/anan_landing_ecosystem_connection_v3.svg"
      alt="منظومة الربط المؤسسي"
      overlay={
        <ConnectionOverlay
          viewBoxWidth={520}
          viewBoxHeight={420}
          lines={[
            { x1: 260, y1: 210, x2: 400, y2: 110, color: "#2563EB", duration: 3.8 },
            { x1: 260, y1: 210, x2: 160, y2: 330, color: "#2563EB", duration: 4, delay: 0.24 },
            { x1: 260, y1: 210, x2: 380, y2: 310, color: "#94A3B8", duration: 4.4, delay: 0.46 },
            { x1: 260, y1: 210, x2: 100, y2: 190, color: "#94A3B8", duration: 4.4, delay: 0.68 },
            { x1: 260, y1: 210, x2: 240, y2: 70, color: "#CBD5E1", duration: 4.8, delay: 0.9 },
          ]}
        />
      }
    />
  );
}

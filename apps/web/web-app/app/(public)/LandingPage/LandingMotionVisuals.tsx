"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type MotionVectorProps = {
  src: string;
  alt: string;
  dark?: boolean;
  width?: number;
  height?: number;
  className?: string;
  overlay?: ReactNode;
};

type SignalLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  duration?: number;
  delay?: number;
};

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
      className={`relative mx-4 overflow-hidden border p-6 md:mx-8 md:p-8 ${dark ? "border-slate-800 bg-slate-950/70" : "border-slate-200 bg-white"} ${className ?? ""}`}
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

/**
 * WHY:   The landing SVGs need motion without rewriting the file-based vectors again.
 * WHAT:  Adds subtle animated signal travel over existing connector geometry.
 * HOW:   Draws low-contrast SVG lines and moving dots on top of the static asset.
 */
function ConnectionOverlay({
  lines,
  viewBoxWidth,
  viewBoxHeight,
}: {
  lines: SignalLine[];
  viewBoxWidth: number;
  viewBoxHeight: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      {lines.map((line, index) => (
        <g key={`${line.x1}-${line.y1}-${index}`}>
          <motion.line
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={line.color}
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ opacity: 0.16 }}
            animate={reduceMotion ? undefined : { opacity: [0.16, 0.42, 0.16] }}
            transition={{
              duration: line.duration ?? 3.6,
              delay: line.delay ?? index * 0.16,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            r="4"
            fill={line.color}
            stroke="white"
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={
              reduceMotion
                ? undefined
                : {
                    cx: [line.x1, line.x2],
                    cy: [line.y1, line.y2],
                    opacity: [0, 1, 0],
                  }
            }
            transition={{
              duration: line.duration ?? 3.6,
              delay: line.delay ?? index * 0.16,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </g>
      ))}
    </svg>
  );
}

/**
 * WHY:   The developer panel should feel live without turning into a fake dashboard.
 * WHAT:  Adds a restrained animated chart trace and point pulses over the dark SVG.
 * HOW:   Reuses the current line coordinates and animates one traveling indicator plus soft point scaling.
 */
function ChartOverlay() {
  const reduceMotion = useReducedMotion();
  const points = [
    { x: 160, y: 210 },
    { x: 220, y: 180 },
    { x: 280, y: 140 },
    { x: 340, y: 115 },
  ];

  return (
    <svg viewBox="0 0 520 420" className="h-full w-full" aria-hidden="true">
      <motion.path
        d="M 160 210 L 220 180 L 280 140 L 340 115"
        fill="none"
        stroke="#60A5FA"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ opacity: 0.18, pathLength: 0.6 }}
        animate={reduceMotion ? undefined : { opacity: [0.18, 0.42, 0.18], pathLength: [0.6, 1, 0.6] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {points.map((point, index) => (
        <motion.circle
          key={`${point.x}-${point.y}`}
          cx={point.x}
          cy={point.y}
          r="5"
          fill="#60A5FA"
          initial={{ opacity: 0.24, scale: 1 }}
          animate={reduceMotion ? undefined : { opacity: [0.24, 0.7, 0.24], scale: [1, 1.18, 1] }}
          transition={{ duration: 2.4, delay: index * 0.22, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <motion.circle
        r="4.5"
        fill="#FFFFFF"
        stroke="#2563EB"
        strokeWidth="2"
        initial={{ opacity: 0 }}
        animate={
          reduceMotion
            ? undefined
            : {
                cx: points.map((point) => point.x),
                cy: points.map((point) => point.y),
                opacity: [0, 1, 1, 0],
              }
        }
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/**
 * WHY:   The hero needs a centered brand visual while aligning with the repo vector style.
 * WHAT:  Wraps the hero brand vector and overlays the shared Anan mark.
 * HOW:   Applies restrained pulse/hover motion to the vector block and logo chip.
 */
export function HeroBrandNetworkVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto mt-4 flex w-full max-w-[680px] items-center justify-center px-4 md:px-8">
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
            lines={[
              { x1: 360, y1: 260, x2: 600, y2: 260, color: "#2563EB", duration: 4.2 },
              { x1: 360, y1: 260, x2: 120, y2: 260, color: "#2563EB", duration: 4.2, delay: 0.3 },
              { x1: 360, y1: 260, x2: 520, y2: 100, color: "#60A5FA", duration: 4.8, delay: 0.5 },
              { x1: 360, y1: 260, x2: 200, y2: 420, color: "#94A3B8", duration: 5.2, delay: 0.7 },
            ]}
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={reduceMotion ? undefined : { scale: [1, 1.025, 1] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
      >
        <div className="rounded-none border border-slate-200 bg-white/96 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
          <Image src="/brand-mark.svg" alt="Anan" width={104} height={104} className="h-[104px] w-[104px]" priority />
        </div>
      </motion.div>
    </div>
  );
}

export function BuyerIntelligenceVisual() {
  return (
    <MotionVector
      src="/vectors/landing/anan_landing_buyers_flow_v3.svg"
      alt="مسار المستثمر والتمويل"
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
            lines={[
              { x1: 310, y1: 260, x2: 500, y2: 370, color: "#2563EB", duration: 4.2 },
              { x1: 310, y1: 260, x2: 120, y2: 150, color: "#2563EB", duration: 4.2, delay: 0.28 },
              { x1: 310, y1: 260, x2: 310, y2: 60, color: "#60A5FA", duration: 4.6, delay: 0.54 },
              { x1: 310, y1: 260, x2: 120, y2: 370, color: "#CBD5E1", duration: 5.1, delay: 0.78 },
            ]}
          />
        </div>
        <motion.div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          animate={reduceMotion ? undefined : { scale: [1, 1.02, 1] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="border border-slate-200 bg-white/96 p-3 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
            <Image src="/brand-mark.svg" alt="A" width={72} height={72} className="h-[72px] w-[72px]" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

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

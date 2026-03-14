"use client";

import { motion } from "framer-motion";

function stableRand01(seed: number) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

/**
 * WHY:   The landing visuals need a stable, deterministic motion motif that feels "alive" without jitter.
 * WHAT:  Renders a radial nexus SVG with repeating line pulses and node highlights.
 * HOW:   Uses deterministic per-index delays (pure) to avoid calling `Math.random()` during render.
 */
export default function MotionNexus() {
    // Generate 24 radiating lines
    const lineCount = 24;
    const lines = Array.from({ length: lineCount }).map((_, i) => {
        const angle = (i * 360) / lineCount;
        const radian = (angle * Math.PI) / 180;
        const x2 = Math.cos(radian) * 280;
        const y2 = Math.sin(radian) * 280;
        return { x2, y2, delay: stableRand01(i + 1) * 2 };
    });

    return (
        <div className="relative w-full aspect-square max-w-[600px] flex items-center justify-center">
            <svg
                viewBox="0 0 600 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
            >
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
                        <stop offset="50%" stopColor="#2563EB" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="1" />
                    </linearGradient>
                </defs>

                <g transform="translate(300, 300)">
                    {/* Radiating Connecting Lines */}
                    {lines.map((line, i) => (
                        <g key={i}>
                            {/* Static background path */}
                            <line
                                x1="0"
                                y1="0"
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#F1F5F9"
                                strokeWidth="1"
                                opacity="0.2"
                            />
                            {/* Animated pulse line */}
                            <motion.line
                                x1="0"
                                y1="0"
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#2563EB"
                                strokeWidth="2"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{
                                    pathLength: [0, 1, 0],
                                    opacity: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: line.delay,
                                    ease: "easeInOut",
                                }}
                            />
                        </g>
                    ))}

                    {/* Peripheral Nodes */}
                    {lines.map((line, i) => (
                        <motion.rect
                            key={`node-${i}`}
                            x={line.x2 - 4}
                            y={line.y2 - 4}
                            width="8"
                            height="8"
                            fill={i % 3 === 0 ? "#2563EB" : "#0F172A"}
                            initial={{ scale: 0.5, opacity: 0.2 }}
                            animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.2, 0.8, 0.2] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                delay: line.delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}

                    {/* Central Logo / Hub */}
                    <motion.g
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.05, 0.8] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {/* Logo Silhouette */}
                        <rect x="-30" y="-40" width="60" height="80" fill="#0F172A" />
                        <rect x="-20" y="-30" width="40" height="60" fill="#2563EB" />
                        {/* "A" identifier */}
                        <path
                            d="M-10 10 L0 -15 L10 10"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="square"
                        />
                        {/* Outer Aura */}
                        <motion.rect
                            x="-40" y="-50" width="80" height="100"
                            stroke="#2563EB"
                            strokeWidth="2"
                            opacity="0.3"
                            animate={{ opacity: [0.1, 0.5, 0.1], scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </motion.g>
                </g>
            </svg>

            {/* Floating Description Labels */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-0 right-0 p-4 border-r-2 border-blue-600 bg-white/80 backdrop-blur-sm"
                >
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Market Converge</span>
                </motion.div>
            </div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * WHY:   Landing pages need small motion accents without forcing the whole page to become a Client Component.
 * WHAT:  Provides a reusable fade-in + slight translate wrapper around arbitrary children.
 * HOW:   Isolates `framer-motion` usage to this client-only boundary; everything else can remain server-rendered.
 */
export default function FadeIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}


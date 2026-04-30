"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ProjectDetailMode } from "../../shared/lib/projectUi";

type ProjectDetailTabsProps = {
  activeMode: ProjectDetailMode;
  projectId: string;
  modes: ProjectDetailMode[];
};

export default function ProjectDetailTabs({
  activeMode,
  projectId,
  modes,
}: ProjectDetailTabsProps) {
  const options = [
    modes.includes("overview") ? { mode: "overview" as const, href: `/ws/projects/${projectId}`, title: "نظرة عامة" } : null,
    modes.includes("units") ? { mode: "units" as const, href: `/ws/projects/${projectId}/units`, title: "الوحدات" } : null,
    modes.includes("analytics") ? { mode: "analytics" as const, href: `/ws/projects/${projectId}/analytics`, title: "التحليلات" } : null,
  ].filter(Boolean) as Array<{ mode: ProjectDetailMode; href: string; title: string }>;

  return (
    <div
      className="flex min-w-0 items-center gap-2 overflow-x-auto border-b border-[color:var(--workspace-border)]"
      role="tablist"
      aria-label="Project sections"
      dir="rtl"
    >
      {options.map((option) => {
        const active = activeMode === option.mode;
        return (
          <Link
            key={option.title}
            href={option.href}
            className={`relative inline-flex h-10 shrink-0 items-center justify-center px-1 text-[12px] font-black transition ${
              active ? "text-foreground" : "text-[var(--workspace-muted)] hover:text-foreground"
            }`}
            role="tab"
            aria-selected={active}
          >
            {active ? (
              <motion.span
                layoutId="project-detail-top-tab"
                className="absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-foreground"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10 px-3">{option.title}</span>
          </Link>
        );
      })}
    </div>
  );
}

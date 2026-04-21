"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Building2, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { cn } from "@/lib/utils";

const cardMotion = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.015, y: -4, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const } },
  tap: { scale: 0.98 },
};

type CreateKind = "project" | "unit";

/**
 * WHY:   Inventory creation needs a calm first decision before users enter a detailed form.
 * WHAT:  Renders the motion selector for creating either a project or a standalone unit.
 * HOW:   Keeps the route client-only for selection state, then navigates into server-backed create routes.
 */
export default function CreateInventorySelectionPage() {
  const { dictionary, isRtl } = useWebLocale();
  const router = useRouter();
  const [selected, setSelected] = useState<CreateKind | null>(null);
  const projects = dictionary.projects;

  const options: Array<{
    kind: CreateKind;
    title: string;
    description: string;
    href: string;
    icon: typeof Building2;
  }> = [
    {
      kind: "project",
      title: projects.createProjectType,
      description: projects.createProjectDesc,
      href: "/ws/projects/create/project",
      icon: Building2,
    },
    {
      kind: "unit",
      title: projects.createUnitType,
      description: projects.createUnitDesc,
      href: "/ws/projects/create/unit",
      icon: Home,
    },
  ];

  return (
    <main
      className="flex min-h-full w-full flex-col items-center justify-center px-4 py-8 pb-20 sm:px-6 lg:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <motion.div
        className="mb-8 flex w-full max-w-5xl items-center"
        initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/ws/projects"
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-5 py-2.5 text-[12px] font-black text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-elevated)] hover:text-foreground"
        >
          <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
          {projects.eyebrow}
        </Link>
      </motion.div>

      <section className={cn("w-full max-w-4xl", isRtl ? "text-right" : "text-left")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
            {projects.createSelectionEyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground lg:text-4xl">
            {projects.createSelectionTitle}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] font-semibold leading-7 text-[var(--workspace-muted)]">
            {projects.createSelectionSubtitle}
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {options.map((option, index) => {
            const Icon = option.icon;
            const active = selected === option.kind;
            return (
              <motion.button
                key={option.kind}
                type="button"
                data-href={option.href}
                onClick={() => setSelected(option.kind)}
                variants={cardMotion}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                animate={active ? { scale: 1, y: -2 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className={cn(
                  "group relative min-h-[220px] overflow-hidden rounded-[24px] border p-7 transition-colors duration-300",
                  isRtl ? "text-right" : "text-left",
                  active
                    ? "border-foreground bg-foreground text-background shadow-xl ring-4 ring-foreground/10"
                    : "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-foreground hover:border-foreground/30",
                )}
              >
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 + index * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    className={cn(
                      "mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] transition-colors duration-300",
                      active ? "bg-background text-foreground" : "bg-foreground/5 text-foreground",
                    )}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">{option.title}</h2>
                  <p className={cn("mt-3 text-[14px] font-semibold leading-7", active ? "text-background/78" : "text-[var(--workspace-muted)]")}>
                    {option.description}
                  </p>
                </motion.div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected ? (
            <motion.div
              className={cn("mt-10 flex", isRtl ? "justify-start" : "justify-end")}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                type="button"
                onClick={() => router.push(options.find((option) => option.kind === selected)?.href ?? "/ws/projects/create/project")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-foreground px-8 py-3 text-[12px] font-black text-background transition hover:bg-foreground/90"
              >
                {projects.continueFlow}
              </motion.button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
}

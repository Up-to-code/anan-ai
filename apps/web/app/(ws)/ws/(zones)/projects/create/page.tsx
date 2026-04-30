"use client";

import { ArrowLeft, Building2, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { cn } from "@/lib/utils";

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
      className="flex min-h-full w-full flex-col px-4 py-8 pb-20 sm:px-6 lg:px-8"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto mb-8 flex w-full max-w-5xl items-center">
        <Link
          href="/ws/projects"
          className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-4 py-2.5 text-[12px] font-black text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-elevated)] hover:text-foreground"
        >
          <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
          {projects.eyebrow}
        </Link>
      </div>

      <section className={cn("mx-auto w-full max-w-5xl", isRtl ? "text-right" : "text-left")}>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--workspace-muted)]">
            {projects.createSelectionEyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground lg:text-5xl">
            {projects.createSelectionTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] font-semibold leading-7 text-[var(--workspace-muted)]">
            {projects.createSelectionSubtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {options.map((option, index) => {
            const Icon = option.icon;
            const active = selected === option.kind;
            return (
              <button
                key={option.kind}
                type="button"
                data-testid={`create-inventory-option-${option.kind}`}
                data-href={option.href}
                onClick={() => setSelected(option.kind)}
                className={cn(
                  "group relative min-h-[190px] overflow-hidden rounded-lg border p-6 transition",
                  isRtl ? "text-right" : "text-left",
                  active
                    ? "border-foreground bg-foreground text-background shadow-sm ring-4 ring-foreground/10"
                    : "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-foreground hover:border-foreground/30",
                )}
              >
                <div className="flex h-full flex-col justify-between gap-8">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active ? "bg-background text-foreground" : "bg-foreground/5 text-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{option.title}</h2>
                      <p className={cn("mt-3 text-[14px] font-semibold leading-7", active ? "text-background/78" : "text-[var(--workspace-muted)]")}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                  <div className={cn("text-[12px] font-black", active ? "text-background" : "text-[var(--workspace-muted)]")}>
                    {index === 0 ? "Project first: overview, media, units, analytics." : "Unit first: one sellable asset, no parent project required."}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className={cn("mt-8 flex", isRtl ? "justify-start" : "justify-end")}>
          <button
            type="button"
            data-testid="create-inventory-continue"
            disabled={!selected}
            onClick={() => router.push(options.find((option) => option.kind === selected)?.href ?? "/ws/projects/create/project")}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-foreground px-8 py-3 text-[12px] font-black text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {projects.continueFlow}
          </button>
        </div>
      </section>
    </main>
  );
}

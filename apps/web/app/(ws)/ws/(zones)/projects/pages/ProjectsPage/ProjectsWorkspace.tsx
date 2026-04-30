"use client";

import Link from "next/link";
import { Building2, Home, Plus, Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import type { WorkspaceProject } from "../../types/projectTypes";
import { unitStatusLabels } from "../../shared/lib/projectUi";
import { useProjectsWorkspaceQuery } from "../../queries/useProjectsWorkspaceQuery";
import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";
import ProjectPortfolioCard from "./ProjectPortfolioCard";

type ProjectsWorkspaceProps = {
  audience: WorkspaceAudience;
  initialProjects: WorkspaceProject[];
};

type InventoryView = "projects" | "units";

type InventoryUnitCard = {
  key: string;
  href: string;
  title: string;
  projectTitle: string;
  location: string;
  priceLabel: string;
  statusLabel: string;
  specs: string[];
  image: string;
};

function buildUnitCards(projects: WorkspaceProject[]): InventoryUnitCard[] {
  return projects.flatMap((project) => {
    if (project.inventoryKind === "standalone_unit") {
      return [{
        key: project.id,
        href: `/ws/projects/${project.id}`,
        title: project.title,
        projectTitle: "وحدة مستقلة",
        location: project.location,
        priceLabel: project.priceLabel,
        statusLabel: unitStatusLabels[project.specs.status] ?? project.readiness.label,
        specs: [project.specs.rooms, project.specs.baths, project.specs.area].filter(Boolean),
        image: project.image,
      }];
    }

    return project.units.map((unit) => ({
      key: `${project.id}-${unit.id}`,
      href: `/ws/projects/${project.id}/units/${unit.id}`,
      title: unit.label,
      projectTitle: project.title,
      location: project.location,
      priceLabel: unit.priceLabel ?? project.priceLabel,
      statusLabel: unitStatusLabels[unit.status ?? "draft"] ?? "غير مصنفة",
      specs: [
        typeof unit.bedrooms === "number" ? `${unit.bedrooms} غرف` : null,
        typeof unit.bathrooms === "number" ? `${unit.bathrooms} حمامات` : null,
        unit.area ?? null,
      ].filter(Boolean) as string[],
      image: unit.floorPlanMedia?.[0]?.url ?? project.image,
    }));
  });
}

function InventoryTabs({
  activeView,
  projectCount,
  unitCount,
  onChange,
}: {
  activeView: InventoryView;
  projectCount: number;
  unitCount: number;
  onChange: (view: InventoryView) => void;
}) {
  const tabs = [
    { key: "projects" as const, label: "Projects", count: projectCount, icon: Building2 },
    { key: "units" as const, label: "Units", count: unitCount, icon: Home },
  ];

  return (
    <div className="inline-flex w-full max-w-md rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-1" role="tablist" aria-label="Inventory type">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeView === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-[13px] font-black transition ${
              active
                ? "bg-[var(--workspace-panel)] text-foreground shadow-sm"
                : "text-[var(--workspace-muted)] hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[11px]">{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
}

function UnitInventoryCard({ unit }: { unit: InventoryUnitCard }) {
  return (
    <Link
      href={unit.href}
      className="group grid overflow-hidden rounded-lg border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-right transition hover:border-foreground/30 hover:shadow-sm sm:grid-cols-[150px_minmax(0,1fr)]"
    >
      <div className="relative aspect-[4/3] bg-[var(--workspace-elevated)] sm:aspect-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={unit.image} alt={unit.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
      </div>
      <div className="flex min-w-0 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[var(--workspace-elevated)] px-3 py-1 text-[11px] font-black text-[var(--workspace-muted)]">
            {unit.statusLabel}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[16px] font-black text-foreground">{unit.title}</div>
            <div className="mt-1 truncate text-[12px] font-bold text-[var(--workspace-muted)]">{unit.projectTitle} · {unit.location}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {unit.specs.map((spec) => (
            <span key={spec} className="inline-flex items-center gap-1 rounded-full border border-[color:var(--workspace-border)] px-3 py-1 text-[12px] font-bold text-foreground">
              <Ruler className="h-3.5 w-3.5 text-[var(--workspace-muted)]" />
              {spec}
            </span>
          ))}
        </div>
        <div className="mt-auto text-[17px] font-black text-foreground">{unit.priceLabel}</div>
      </div>
    </Link>
  );
}

/**
 * WHY:   Operators need one clean inventory entry point instead of mixed project/status filters.
 * WHAT:  Renders a two-tab Projects/Units workspace with separate cards for parent projects and sellable units.
 * HOW:   Keeps the switch client-side and derives unit cards from the already loaded project dossiers.
 */
export default function ProjectsWorkspace({
  audience,
  initialProjects,
}: ProjectsWorkspaceProps) {
  const { dictionary } = useWebLocale();
  const { projects } = useProjectsWorkspaceQuery({ audience, initialProjects });
  const [activeView, setActiveView] = useState<InventoryView>("projects");

  const projectCards = useMemo(() => projects.filter((project) => project.inventoryKind === "project"), [projects]);
  const unitCards = useMemo(() => buildUnitCards(projects), [projects]);

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow={dictionary.projects.eyebrow}
        title={dictionary.projects.title}
        description={dictionary.projects.description}
        actions={
          <Link
            href="/ws/projects/create"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-[13px] font-bold text-background shadow-sm transition hover:bg-foreground/90"
          >
            <Plus className="h-4 w-4" />
            {dictionary.projects.create}
          </Link>
        }
      />

      <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <InventoryTabs
            activeView={activeView}
            projectCount={projectCards.length}
            unitCount={unitCards.length}
            onChange={setActiveView}
          />
          <div className="text-right text-[12px] font-semibold leading-6 text-muted-foreground">
            {activeView === "projects"
              ? "Projects show the parent asset: gallery, title, status, units, and pricing."
              : "Units show only sellable inventory with the parent project context."}
          </div>
        </div>

        {activeView === "projects" ? (
          <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
            {projectCards.map((project) => (
              <ProjectPortfolioCard
                key={project.id}
                project={project}
              />
            ))}
            {projectCards.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-5 py-12 text-center text-[13px] font-black text-muted-foreground">
                لا توجد مشاريع بعد. ابدأ بمشروع جديد ثم أضف الوحدات داخله.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {unitCards.map((unit) => (
              <UnitInventoryCard key={unit.key} unit={unit} />
            ))}
            {unitCards.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-5 py-12 text-center text-[13px] font-black text-muted-foreground">
                لا توجد وحدات بعد. افتح مشروعاً وأضف الوحدات الخاصة به.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

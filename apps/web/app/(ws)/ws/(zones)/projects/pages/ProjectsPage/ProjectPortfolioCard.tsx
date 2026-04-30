"use client";

import Link from "next/link";
import { CheckCircle2, Layers3, MapPin, ShieldCheck } from "lucide-react";
import { trackProjectEventAction } from "../../actions/trackProjectEvent";
import type { WorkspaceProject } from "../../types/projectTypes";

type ProjectPortfolioCardProps = {
  project: WorkspaceProject;
};

/**
 * WHY:   The projects index should help operators scan inventory quickly without dashboard noise.
 * WHAT:  Renders a simple project card with image, title, location, and average/starting price.
 * HOW:   Keeps the whole card as the primary detail link and records a lightweight open event.
 */
export default function ProjectPortfolioCard({
  project,
}: ProjectPortfolioCardProps) {
  return (
    <Link
      href={`/ws/projects/${project.id}`}
      onClick={() => {
        void trackProjectEventAction({
          propertyId: project.propertyId,
          eventType: "project_detail_view",
          source: "projects_list_card",
        });
      }}
      className="group block overflow-hidden rounded-2xl bg-[var(--workspace-panel)] text-right transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--workspace-elevated)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute right-4 top-4 rounded-full bg-black/55 px-3 py-1 text-[11px] font-black text-white backdrop-blur">
          {project.portfolio.typeLabel}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
          <div className="text-lg font-black leading-6">{project.title}</div>
          <div className="mt-2 inline-flex items-center gap-1 text-[12px] font-bold text-white/80">
            <MapPin className="h-3.5 w-3.5" />
            {project.location}
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[12px] font-bold text-[var(--workspace-muted)]">متوسط السعر</span>
          <span className="text-[15px] font-black text-foreground">{project.priceLabel}</span>
        </div>
        <div className="grid gap-2 text-[12px] font-bold text-[var(--workspace-muted)]">
          <div className="flex items-center justify-end gap-2">
            <span>{project.portfolio.unitSummary}</span>
            <Layers3 className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <span>{project.readiness.label}</span>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="truncate">{project.portfolio.complianceSummary}</span>
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

"use client";

import Link from "next/link";
import {
  ArrowUpLeft,
  Building2,
  Eye,
  FileText,
  Layers3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { WorkspaceProject } from "../../types/projectTypes";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";

type ProjectPortfolioCardProps = {
  project: WorkspaceProject;
  onTrackProjectEvent?: (input: {
    id: string;
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<{ ok: true }>;
};

/**
 * WHY:   The projects index should scan like an operator dashboard, not a generic listing grid.
 * WHAT:  Renders one project card with readiness, visibility, inventory, broker, and document signals plus direct actions.
 * HOW:   Uses one zone-local layout so project-specific metadata stays visible without overloading the shared property card.
 */
export default function ProjectPortfolioCard({
  project,
  onTrackProjectEvent,
}: ProjectPortfolioCardProps) {
  const summary = project.shortDescription || project.summary;
  const publicationLabel =
    project.publicationState === "published" ? "منشور" : project.publicationState === "archived" ? "مؤرشف" : "مسودة";
  const publicationTone =
    project.publicationState === "published"
      ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-700"
      : project.publicationState === "archived"
        ? "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)]"
        : "border-amber-500/30 bg-amber-500/12 text-amber-700";
  const readinessTone = project.readiness.canPublish
    ? "border-sky-500/25 bg-sky-500/10 text-sky-700"
    : "border-amber-500/30 bg-amber-500/12 text-amber-700";
  const visibilityLabel = project.visibility.clientVisibility === "public" ? "عام + AI" : "داخلي";
  const topServices = project.expert.services.slice(0, 3);
  const statCards = [
    { icon: Layers3, label: "الوحدات", value: `${project.units.length}`, helper: "بطاقة" },
    { icon: Users, label: "الوسطاء", value: `${project.brokers.length}`, helper: "نشط" },
    { icon: FileText, label: "الملفات", value: `${project.assets.length}`, helper: "مرفق" },
    { icon: ShieldCheck, label: "التصريح", value: project.permit.statusLabel, helper: "مطابقة" },
  ];

  return (
    <article className="overflow-hidden rounded-[26px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] shadow-sm transition hover:border-foreground/20 hover:shadow-lg">
      <div className="relative h-56 overflow-hidden bg-[var(--workspace-elevated)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.image} alt={project.title} className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${publicationTone}`}>
              {publicationLabel}
            </span>
            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${readinessTone}`}>
              {project.readiness.label}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-black text-white backdrop-blur-sm">
            <Eye className="h-3.5 w-3.5" />
            {visibilityLabel}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 text-right text-white">
          <div className="text-[12px] font-bold text-white/75">{project.location}</div>
          <div className="mt-1 text-2xl font-black tracking-tight">{project.priceLabel}</div>
        </div>
      </div>

      <div className="space-y-5 p-5 text-right">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/ws/projects/${project.id}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] transition hover:text-foreground"
            >
              <ArrowUpLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h2 className="text-[18px] font-black text-foreground">{project.title}</h2>
              <div className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {project.location}
              </div>
            </div>
          </div>
          <p className="line-clamp-2 text-[13px] leading-7 text-muted-foreground">{summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-[18px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-[var(--workspace-muted)]">{stat.label}</div>
                    <div className="mt-1 text-[15px] font-black text-foreground">{stat.value}</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--workspace-panel)] text-[var(--workspace-muted)]">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-muted-foreground">{stat.helper}</div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[18px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3">
            <div className="text-[11px] font-bold text-[var(--workspace-muted)]">الغرف</div>
            <div className="mt-1 text-[14px] font-black text-foreground">{project.specs.rooms}</div>
          </div>
          <div className="rounded-[18px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3">
            <div className="text-[11px] font-bold text-[var(--workspace-muted)]">الحمامات</div>
            <div className="mt-1 text-[14px] font-black text-foreground">{project.specs.baths}</div>
          </div>
          <div className="rounded-[18px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3">
            <div className="text-[11px] font-bold text-[var(--workspace-muted)]">المساحة</div>
            <div className="mt-1 text-[14px] font-black text-foreground">{project.specs.area}</div>
          </div>
        </div>

        {topServices.length > 0 ? (
          <div className="rounded-[18px] border border-[color:var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_7%,var(--workspace-panel))] p-4">
            <div className="inline-flex items-center gap-2 text-[12px] font-black text-foreground">
              <Sparkles className="h-4 w-4 text-[var(--workspace-highlight)]" />
              المزايا الأبرز
            </div>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              {topServices.map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] px-3 py-1.5 text-[12px] font-bold text-foreground"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--workspace-border)] pt-4">
          <Link
            href={`/ws/projects/${project.id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-2.5 text-[12px] font-black text-foreground transition hover:bg-[var(--workspace-accent-soft)]"
          >
            فتح التفاصيل
          </Link>
          <Link
            href={`/ws/projects/${project.id}/analytics`}
            onClick={() => {
              void onTrackProjectEvent?.({
                id: project.id,
                eventType: "project_analyze_click",
                source: "projects_list_card",
              });
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-foreground px-4 py-2.5 text-[12px] font-black text-background transition hover:bg-foreground/90 disabled:opacity-60"
          >
            تحليل
          </Link>
        </div>
      </div>
    </article>
  );
}

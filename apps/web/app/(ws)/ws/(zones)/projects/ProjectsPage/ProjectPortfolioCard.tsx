"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import PropertyCard from "../../../_components/Visuals/PropertyCard";
import type { WorkspaceProject } from "../projectTypes";
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
 * WHY:   The projects index needs a zone-local card that keeps the shared property visual clean while exposing project-specific actions.
 * WHAT:  Renders one simplified project portfolio card with an analyze CTA and a secondary open-details action.
 * HOW:   Reuses the shared `PropertyCard` for the visual shell, then handles analytics tracking locally before navigation.
 */
export default function ProjectPortfolioCard({
  project,
  onTrackProjectEvent,
}: ProjectPortfolioCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <PropertyCard
      image={project.image}
      title={project.title}
      location={project.location}
      priceLabel={project.priceLabel}
      summary={project.shortDescription || project.summary}
      specs={[
        { label: "الغرف", value: project.specs.rooms },
        { label: "الحمامات", value: project.specs.baths },
        { label: "المساحة", value: project.specs.area },
      ]}
      density="flexible"
      footer={
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await onTrackProjectEvent?.({
                  id: project.id,
                  eventType: "project_analyze_click",
                  source: "projects_list_card",
                });
                router.push(`/ws/projects/${project.id}/analytics`);
              })
            }
            className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-2 text-[12px] font-bold text-background transition hover:bg-foreground/90 disabled:opacity-60"
          >
            {isPending ? "جارٍ الفتح..." : "تحليل"}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/ws/projects/${project.id}`)}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-[12px] font-bold text-foreground transition hover:bg-muted"
          >
            فتح التفاصيل
          </button>
        </div>
      }
    />
  );
}

import Link from "next/link";
import DataTable from "@/components/shared/DataTable";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getProjectReadinessQueuePageData } from "@/admin_zone/api/projects";
import { projectReadinessTabs } from "@/lib/adminSectionTabs";
import type { ProjectReadinessQueueFilter } from "@/server/infrastructure/convex/adminProjectsRepository";
import { submitProjectMigrationAction } from "./actions";

function value(record: Record<string, unknown> | null | undefined, key: string, fallback = "غير متوفر") {
  const raw = record?.[key];
  return typeof raw === "string" && raw.length > 0 ? raw : fallback;
}

function readiness(record: Record<string, unknown>) {
  const dossier = record.dossier as Record<string, unknown> | undefined;
  return typeof dossier?.readinessStatus === "string" ? dossier.readinessStatus : "incomplete";
}

/**
 * WHY:   Admins need a visible queue to judge Saudi project readiness before public distribution.
 * WHAT:  Renders readiness-filtered dossiers with blocker counts and migration operation controls.
 * HOW:   Loads Convex admin queue data server-side and keeps actions behind server forms.
 */
export default async function ProjectReadinessPage({ filter }: { filter: ProjectReadinessQueueFilter }) {
  const { rows } = await getProjectReadinessQueuePageData(filter);

  return (
    <SectionScaffold
      eyebrow="امتثال المشاريع"
      title="جاهزية المشاريع السعودية"
      description="قائمة تشغيلية لمراجعة ملفات المشاريع قبل البحث العام، الذكاء الاصطناعي، واتاحة العروض المفتوحة."
      tabs={projectReadinessTabs}
      layout="list"
      contentWidth="contained"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <WorkspacePanel density="compact">
          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">الفلتر الحالي</div>
          <div className="mt-3 text-2xl font-black tracking-tight text-foreground">{filter}</div>
          <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">البيانات هنا تشغيلية وليست حكماً قانونياً نهائياً.</p>
        </WorkspacePanel>
        <WorkspacePanel density="compact" className="lg:col-span-2">
          <form action={submitProjectMigrationAction} className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
            <input name="limit" defaultValue="200" className="h-11 rounded-lg border border-border bg-background px-3 text-sm font-bold" />
            <button name="action" value="preflight" className="rounded-lg border border-border px-4 py-2 text-xs font-black uppercase tracking-widest">
              Preflight
            </button>
            <button name="action" value="migrate" className="rounded-lg bg-foreground px-4 py-2 text-xs font-black uppercase tracking-widest text-background">
              Migrate
            </button>
            <button name="action" value="postflight" className="rounded-lg border border-border px-4 py-2 text-xs font-black uppercase tracking-widest">
              Postflight
            </button>
          </form>
        </WorkspacePanel>
      </div>

      <WorkspacePanel density="default" bodyClassName="!px-0 !py-0">
        <DataTable headers={["المشروع", "الحالة", "المدينة", "الحي", "العوائق", "الإجراء التالي"]} className="rounded-none border-0 bg-transparent shadow-none">
          {rows.map((row) => {
            const dossier = (row.dossier ?? {}) as Record<string, unknown>;
            const property = (row.property ?? {}) as Record<string, unknown>;
            const blockers = Array.isArray((row.readiness as Record<string, unknown> | undefined)?.blockers)
              ? ((row.readiness as Record<string, unknown>).blockers as Array<Record<string, unknown>>)
              : [];
            const location = (dossier.location ?? {}) as Record<string, unknown>;
            const dossierId = value(dossier, "_id", "");
            return (
              <tr key={dossierId} className="transition-colors hover:bg-muted/5">
                <td className="px-5 py-4">
                  <Link href={`/projects/${dossierId}`} className="block font-black tracking-tight text-foreground transition-colors hover:text-primary">
                    {value(dossier, "title", value(property, "title"))}
                  </Link>
                  <div className="mt-1 text-[11px] font-bold text-muted-foreground/60">{value(dossier, "projectType")}</div>
                </td>
                <td className="px-5 py-4"><StatusBadge value={readiness(row)} /></td>
                <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{value(location, "city")}</td>
                <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{value(location, "district")}</td>
                <td className="px-5 py-4 text-[13px] font-black text-muted-foreground/70">{blockers.length}</td>
                <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">
                  {typeof blockers[0]?.nextAction === "string" ? blockers[0].nextAction : "No immediate blocker"}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </WorkspacePanel>
    </SectionScaffold>
  );
}

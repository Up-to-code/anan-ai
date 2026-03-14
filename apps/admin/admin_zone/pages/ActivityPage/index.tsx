import { getActivityPageData } from "@/admin_zone/api/activity";
import EmptyState from "@/components/shared/EmptyState";
import JsonPreview from "@/components/shared/JsonPreview";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatDateTime } from "@/lib/format";

type ActivityPageProps = {
  tab?: "all" | "notifications" | "messages" | "admin-log";
};

/**
 * WHY:   The activity area now splits one merged operational feed into simple route-backed source tabs.
 * WHAT:  Renders the requested activity feed source in a compact Arabic timeline.
 * HOW:   Loads the filtered feed from the activity API and maps each item into one consistent card layout.
 */
export default async function ActivityPage({ tab = "all" }: ActivityPageProps) {
  const { rows } = await getActivityPageData(tab);
  const items = rows as Array<Record<string, unknown>>;

  if (items.length === 0) {
    return <EmptyState title="لا توجد أحداث" description="لم يتم العثور على نشاط ضمن هذا القسم الآن." />;
  }

  return (
    <WorkspacePanel className="space-y-4">
      {items.map((item, index) => (
        <div key={String(item.id ?? index)} className="border-2 border-slate-100 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="font-black text-slate-900">{String(item.title ?? "حدث")}</div>
              <div className="text-sm font-semibold text-slate-600">{String(item.subtitle ?? "بدون وصف")}</div>
              <div className="text-xs font-semibold text-slate-500">{formatDateTime(Number(item.createdAt ?? 0))}</div>
            </div>
            <StatusBadge value={String((item.metadata as Record<string, unknown> | undefined)?.status ?? item.source ?? "unknown")} />
          </div>
          {item.metadata ? <JsonPreview value={item.metadata} className="mt-4" /> : null}
        </div>
      ))}
    </WorkspacePanel>
  );
}

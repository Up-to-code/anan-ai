import Link from "next/link";
import { getVerificationsPageData } from "@/admin_zone/api/verifications";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { labelForVerificationType } from "@/lib/adminLabels";
import { formatDateTime, formatNumber } from "@/lib/format";

type VerificationsPageProps = {
  tab?: "new" | "in_review" | "approved" | "rejected";
};

/**
 * WHY:   Verification queues now live in their own primary workspace with one route per review status.
 * WHAT:  Renders verification summary cards and the requested status-filtered queue.
 * HOW:   Loads the status summary plus the filtered request list and maps them into a simple Arabic table.
 */
export default async function VerificationsPage({ tab = "new" }: VerificationsPageProps) {
  const { rows } = await getVerificationsPageData(tab);
  const items = rows as Array<Record<string, unknown>>;

  return (
    <div className="space-y-6">
      <WorkspacePanel>
        {items.length > 0 ? (
          <DataTable headers={["الجهة", "النوع", "المنظمة", "المستندات", "تاريخ الإرسال", "المراجعة"]}>
            {items.map((item) => (
              <tr key={String(item._id)} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-3 font-black text-slate-900">{String(item.subjectName ?? "طلب تحقق")}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{labelForVerificationType(String(item.requestType ?? "user"))}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{String(item.organizationName ?? "غير متوفر")}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatNumber(Number(item.documentsCount ?? 0))}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-600">{formatDateTime(Number(item.submittedAt ?? 0))}</td>
                <td className="px-4 py-3 text-sm font-black text-blue-600">
                  <Link href={`/verifications/${encodeURIComponent(String(item._id))}`}>فتح الطلب</Link>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="لا توجد طلبات" description="لا توجد طلبات تحقق في هذا التصنيف حاليًا." />
        )}
      </WorkspacePanel>
    </div>
  );
}

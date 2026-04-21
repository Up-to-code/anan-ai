import Link from "next/link";
import { getVerificationsPageData } from "@/admin_zone/api/verifications";
import { AdminMetricGrid } from "@/components/shared/AdminPageLayout";
import DataTable from "@/components/shared/DataTable";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { verificationTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";
import { labelForVerificationType } from "@/lib/adminLabels";

function toRequestId(row: Record<string, unknown>) {
  return String(row._id ?? row.id ?? "");
}

function toStringValue(value: unknown, fallback = "غير متوفر") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function toNumberValue(value: unknown) {
  return typeof value === "number" ? value : null;
}

/**
 * WHY:   Admin operations need one live queue that shows every organization and property verification request in one place.
 * WHAT:  Renders the verification review queue from the Convex-backed admin repository.
 * HOW:   Loads the summary counters and rows on the server, then presents them in shared admin panels and a dense review table.
 */
export default async function VerificationsPage() {
  const { summary, rows } = await getVerificationsPageData();

  return (
    <SectionScaffold
      eyebrow="الامتثال"
      title="طلبات التوثيق"
      description="مراجعة واعتماد أو إغلاق طلبات توثيق المنظمات والإعلانات من لوحة الأدمن."
      tabs={verificationTabs}
      layout="list"
      contentWidth="contained"
    >
      <AdminMetricGrid minItemWidth={180}>
        <WorkspacePanel density="compact">
          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">جديد</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{summary.new}</div>
        </WorkspacePanel>
        <WorkspacePanel density="compact">
          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">قيد المراجعة</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{summary.inReview}</div>
        </WorkspacePanel>
        <WorkspacePanel density="compact">
          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">معتمد</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{summary.approved}</div>
        </WorkspacePanel>
        <WorkspacePanel density="compact">
          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">مرفوض</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{summary.rejected}</div>
        </WorkspacePanel>
        <WorkspacePanel density="compact">
          <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">مغلق</div>
          <div className="mt-3 text-3xl font-black tracking-tight text-foreground">{summary.closed}</div>
        </WorkspacePanel>
      </AdminMetricGrid>

      <WorkspacePanel density="default" bodyClassName="!px-0 !py-0">
        <DataTable headers={["الطلب", "النوع", "المنظمة", "الحالة", "الملفات", "تاريخ الإرسال"]} className="rounded-none border-0 bg-transparent shadow-none">
          {rows.map((row) => {
            const requestId = toRequestId(row);
            return (
              <tr key={requestId} className="group transition-colors hover:bg-muted/5">
                <td className="px-5 py-4">
                  <Link href={`/verifications/${requestId}`} className="block font-black tracking-tight text-foreground transition-colors hover:text-primary">
                    {toStringValue(row.subjectName)}
                  </Link>
                  <div className="mt-1 text-[11px] font-bold text-muted-foreground/60">
                    {toStringValue(row.title, "طلب توثيق")}
                  </div>
                </td>
                <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">
                  {labelForVerificationType(typeof row.requestType === "string" ? row.requestType : null)}
                </td>
                <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">
                  {toStringValue(row.organizationName)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge value={typeof row.currentStatus === "string" ? row.currentStatus : null} />
                </td>
                <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">
                  {toNumberValue(row.documentsCount) ?? 0}
                </td>
                <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/50">
                  {formatDateTime(toNumberValue(row.submittedAt))}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </WorkspacePanel>
    </SectionScaffold>
  );
}

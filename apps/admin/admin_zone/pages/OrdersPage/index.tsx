import { revalidatePath } from "next/cache";
import { getAdminOrdersPageData, updateAdminOrder } from "@/admin_zone/api/orders";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import MetricBarChart from "@/components/shared/MetricBarChart";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatDateTime, formatNumber } from "@/lib/format";

type OrdersPageProps = {
  searchParams: {
    status?:
      | "new_lead"
      | "contacted"
      | "qualified"
      | "offer_made"
      | "under_contract"
      | "closed_won"
      | "closed_lost";
    sourceChannel?: "whatsapp" | "app" | "web";
    assignment?: "all" | "assigned" | "unassigned";
  };
};

const statusLabels: Record<string, string> = {
  new_lead: "طلب جديد",
  contacted: "تم التواصل",
  qualified: "مؤهل",
  offer_made: "عرض مقدم",
  under_contract: "تحت التعاقد",
  closed_won: "مغلق - رابح",
  closed_lost: "مغلق - خاسر",
};

const channelLabels: Record<"whatsapp" | "app" | "web", string> = {
  whatsapp: "واتساب",
  app: "التطبيق",
  web: "الويب",
};

/**
 * WHY:   Orders remain one of the core operational queues and should surface both queue health and row-level editing in one place.
 * WHAT:  Renders the filtered orders list with summary cards, queue charts, and inline update controls.
 * HOW:   Loads the orders server-side, derives lightweight queue summaries, and persists row edits through a server action.
 */
export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const assignmentFilter = searchParams.assignment ?? "all";
  const data = await getAdminOrdersPageData({
    status: searchParams.status,
    sourceChannel: searchParams.sourceChannel,
    assignment: assignmentFilter,
  });

  const ordersByChannel = data.orders.reduce(
    (acc, order) => {
      if (order.sourceChannel) {
        acc[order.sourceChannel] += 1;
      }
      return acc;
    },
    { whatsapp: 0, app: 0, web: 0 },
  );

  const ordersByStatus = [
    { label: "جديد", value: data.orders.filter((order) => order.status === "new_lead").length },
    { label: "تم التواصل", value: data.orders.filter((order) => order.status === "contacted").length },
    { label: "مؤهل", value: data.orders.filter((order) => order.status === "qualified").length },
    { label: "عرض", value: data.orders.filter((order) => order.status === "offer_made").length },
    { label: "تعاقد", value: data.orders.filter((order) => order.status === "under_contract").length },
  ];

  async function updateOrderAction(formData: FormData) {
    "use server";

    await updateAdminOrder({
      id: String(formData.get("id") ?? ""),
      status: String(formData.get("status") ?? "") as
        | "new_lead"
        | "contacted"
        | "qualified"
        | "offer_made"
        | "under_contract"
        | "closed_won"
        | "closed_lost",
      notes: String(formData.get("notes") ?? "").trim() || undefined,
      assignedTo: String(formData.get("assignedTo") ?? "").trim() || undefined,
    });

    revalidatePath("/orders");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي الطلبات" value={formatNumber(data.orders.length)} />
        <StatCard label="غير مُسند" value={formatNumber(data.orders.filter((order) => !order.assignedTo).length)} />
        <StatCard label="واتساب" value={formatNumber(ordersByChannel.whatsapp)} />
        <StatCard label="مؤهل أو أكثر" value={formatNumber(data.orders.filter((order) => ["qualified", "offer_made", "under_contract", "closed_won"].includes(order.status)).length)} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">فلاتر الطابور</h2>
            <p className="mt-1 text-sm text-slate-500">تصفية الطلبات حسب المرحلة، القناة، وحالة الإسناد.</p>
          </div>
          <form method="get" className="grid gap-3 md:grid-cols-4">
            <select name="status" defaultValue={searchParams.status ?? ""} className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm">
              <option value="">كل الحالات</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select name="sourceChannel" defaultValue={searchParams.sourceChannel ?? ""} className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm">
              <option value="">كل القنوات</option>
              <option value="whatsapp">{channelLabels.whatsapp}</option>
              <option value="app">{channelLabels.app}</option>
              <option value="web">{channelLabels.web}</option>
            </select>
            <select name="assignment" defaultValue={assignmentFilter} className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm">
              <option value="all">الكل</option>
              <option value="assigned">المُسندة</option>
              <option value="unassigned">غير المُسندة</option>
            </select>
            <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
              تطبيق الفلاتر
            </button>
          </form>
        </WorkspacePanel>

        <WorkspacePanel className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">مراحل الطلبات</h2>
            <p className="mt-1 text-sm text-slate-500">لقطة سريعة على توزع الطلبات داخل الطابور الحالي.</p>
          </div>
          <MetricBarChart
            data={ordersByStatus}
            series={[{ dataKey: "value", label: "الطلبات", color: "#1f2937" }]}
            horizontal
            height={240}
            valueFormatter={(value) => formatNumber(value)}
          />
        </WorkspacePanel>
      </section>

      <WorkspacePanel className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">تفاصيل الطلبات</h2>
          <p className="mt-1 text-sm text-slate-500">تحرير مباشر للحالة، المسؤول، والملاحظات من داخل الجدول.</p>
        </div>
        {data.orders.length > 0 ? (
          <DataTable headers={["الطلب", "القناة", "التاريخ", "الحالة", "المسؤول", "تحديث"]}>
            {data.orders.map((order) => (
              <tr key={order._id} className="border-b border-stone-200 last:border-b-0">
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-slate-900">{order._id}</div>
                  <div className="mt-1 text-xs text-slate-500">المستخدم: {order.userId ?? "غير مرتبط"}</div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">
                  {order.sourceChannel ? channelLabels[order.sourceChannel] : "غير محدد"}
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">{formatDateTime(order._creationTime)}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={order.status} />
                </td>
                <td className="px-4 py-4 text-sm text-slate-700">{order.assignedTo ?? "غير محدد"}</td>
                <td className="px-4 py-4">
                  <form action={updateOrderAction} className="grid gap-2">
                    <input type="hidden" name="id" value={order._id} />
                    <select name="status" defaultValue={order.status} className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm">
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <input name="assignedTo" defaultValue={order.assignedTo ?? ""} placeholder="المسؤول" className="h-10 rounded-md border border-stone-300 bg-white px-3 text-sm" />
                    <textarea name="notes" defaultValue={order.notes ?? ""} placeholder="ملاحظات" className="min-h-20 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm" />
                    <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                      حفظ
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="لا توجد طلبات" description="لم يتم العثور على طلبات ضمن هذا التصنيف." />
        )}
      </WorkspacePanel>
    </div>
  );
}

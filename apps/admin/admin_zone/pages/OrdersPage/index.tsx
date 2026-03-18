import { revalidatePath } from "next/cache";
import { getAdminOrdersPageData, updateAdminOrder } from "@/admin_zone/api/orders";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatDateTime } from "@/lib/format";

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
 * WHY:   Admin operators need a fast operational surface to triage and update order progression.
 * WHAT:  Renders the filtered orders list — one focused table with inline update per row.
 * HOW:   Loads the orders server-side and submits each row's update through a server action.
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
    <WorkspacePanel>
      <form method="get" className="mb-4 grid gap-2 border border-slate-200 bg-white p-3 md:grid-cols-4">
        <select name="status" defaultValue={searchParams.status ?? ""} className="h-10 w-full border border-slate-200 px-3 text-sm">
          <option value="">كل الحالات</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select name="sourceChannel" defaultValue={searchParams.sourceChannel ?? ""} className="h-10 w-full border border-slate-200 px-3 text-sm">
          <option value="">كل القنوات</option>
          <option value="whatsapp">{channelLabels.whatsapp}</option>
          <option value="app">{channelLabels.app}</option>
          <option value="web">{channelLabels.web}</option>
        </select>
        <select name="assignment" defaultValue={assignmentFilter} className="h-10 w-full border border-slate-200 px-3 text-sm">
          <option value="all">الكل</option>
          <option value="assigned">المُسندة</option>
          <option value="unassigned">غير المُسندة</option>
        </select>
        <button type="submit" className="border-2 border-slate-900 bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
          تطبيق الفلاتر
        </button>
      </form>

      <div className="mb-4 grid gap-2 text-xs font-semibold text-slate-600 md:grid-cols-4">
        <div className="border border-slate-200 bg-white px-3 py-2">الإجمالي: {data.orders.length}</div>
        <div className="border border-slate-200 bg-white px-3 py-2">واتساب: {ordersByChannel.whatsapp}</div>
        <div className="border border-slate-200 bg-white px-3 py-2">التطبيق: {ordersByChannel.app}</div>
        <div className="border border-slate-200 bg-white px-3 py-2">الويب: {ordersByChannel.web}</div>
      </div>

      {data.orders.length > 0 ? (
        <DataTable headers={["الطلب", "القناة", "التاريخ", "الحالة", "المسؤول", "تحديث"]}>
          {data.orders.map((order) => (
            <tr key={order._id} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-4">
                <div className="text-sm font-black text-slate-900">{order._id}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">المستخدم: {order.userId ?? "غير مرتبط"}</div>
              </td>
              <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                {order.sourceChannel ? channelLabels[order.sourceChannel] : "غير محدد"}
              </td>
              <td className="px-4 py-4 text-sm font-semibold text-slate-700">{formatDateTime(order._creationTime)}</td>
              <td className="px-4 py-4">
                <StatusBadge value={order.status} />
              </td>
              <td className="px-4 py-4 text-sm font-semibold text-slate-700">{order.assignedTo ?? "غير محدد"}</td>
              <td className="px-4 py-4">
                <form action={updateOrderAction} className="grid gap-2">
                  <input type="hidden" name="id" value={order._id} />
                  <select name="status" defaultValue={order.status} className="h-10 w-full border border-slate-200 px-3 text-sm">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <input name="assignedTo" defaultValue={order.assignedTo ?? ""} placeholder="المسؤول" className="h-10 w-full border border-slate-200 px-3 text-sm" />
                  <textarea name="notes" defaultValue={order.notes ?? ""} placeholder="ملاحظات" className="min-h-20 w-full border border-slate-200 px-3 py-2 text-sm" />
                  <button type="submit" className="border-2 border-blue-600 bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
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
  );
}

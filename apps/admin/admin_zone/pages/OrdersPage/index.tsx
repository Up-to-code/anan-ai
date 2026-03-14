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

/**
 * WHY:   Admin operators need a fast operational surface to triage and update order progression.
 * WHAT:  Renders the filtered orders list — one focused table with inline update per row.
 * HOW:   Loads the orders server-side and submits each row's update through a server action.
 */
export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const data = await getAdminOrdersPageData(searchParams.status);

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
      {data.orders.length > 0 ? (
        <DataTable headers={["الطلب", "التاريخ", "الحالة", "المسؤول", "تحديث"]}>
          {data.orders.map((order) => (
            <tr key={order._id} className="border-b border-slate-100 last:border-b-0">
              <td className="px-4 py-4">
                <div className="text-sm font-black text-slate-900">{order._id}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">المستخدم: {order.userId ?? "غير مرتبط"}</div>
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

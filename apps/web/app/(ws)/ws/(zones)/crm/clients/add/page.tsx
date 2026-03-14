import Link from "next/link";
import { redirect } from "next/navigation";
import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceCrmZone, getWorkspacePropertyZone } from "@/server/ws/zones";

/**
 * WHY:   CRM add-client should create a persisted deal/contact record instead of logging mock form data.
 * WHAT:  Renders a simple server-backed client/deal creation form.
 * HOW:   Submits directly to the audience-specific CRM server action and redirects to the CRM board on success.
 */
export default async function AddClientPage() {
  const workspace = await requireWorkspaceData("/ws/crm/clients/add");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const crmZone = getWorkspaceCrmZone(audience, ownerContext);
  const properties = await getWorkspacePropertyZone(audience, ownerContext).listProperties({
    paginationOpts: { cursor: null, numItems: 100 },
  });

  async function createClient(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const budget = Number(String(formData.get("budget") ?? "").replace(/[^\d.]/g, "")) || undefined;
    const preference = String(formData.get("preference") ?? "").trim();
    const propertyId = String(formData.get("propertyId") ?? "").trim() || undefined;

    await getWorkspaceCrmZone(audience, ownerContext).createDeal({
      title: name,
      contactName: name,
      contactPhone: phone || undefined,
      value: budget,
      description: preference || undefined,
      propertyId,
      stage: "new",
    });

    redirect("/ws/crm");
  }

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro eyebrow="إدارة العملاء" title="إضافة عميل جديد" description="أنشئ صفقة CRM جديدة مرتبطة بعميل وعقار اختياري." />

      <div className="max-w-2xl px-6 py-6 lg:px-8 lg:py-8">
        <form action={createClient} className="grid gap-6 border border-slate-200 bg-white p-8">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">اسم العميل</label>
            <input name="name" required className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">رقم الهاتف</label>
            <input name="phone" className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">الميزانية</label>
            <input name="budget" className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">الوصف / الاهتمام</label>
            <textarea name="preference" rows={4} className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700" />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-500">العقار المرتبط</label>
            <select name="propertyId" className="w-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900">
              <option value="">بدون عقار</option>
              {properties.page.map((property) => (
                <option key={property._id} value={property._id}>
                  {property.title} - {property.location ?? property.address}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-slate-950 px-5 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white">
              حفظ العميل
            </button>
            <Link href="/ws/crm" className="flex-1 border border-slate-200 px-5 py-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-700">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

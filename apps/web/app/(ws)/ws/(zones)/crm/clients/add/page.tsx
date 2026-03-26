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
    const nextFollowUpRaw = String(formData.get("nextFollowUpAt") ?? "").trim();
    const nextFollowUpAt = nextFollowUpRaw ? Date.parse(nextFollowUpRaw) : undefined;

    await getWorkspaceCrmZone(audience, ownerContext).createDeal({
      title: name,
      contactName: name,
      contactPhone: phone || undefined,
      value: budget,
      description: preference || undefined,
      propertyId,
      nextFollowUpAt: typeof nextFollowUpAt === "number" && !Number.isNaN(nextFollowUpAt) ? nextFollowUpAt : undefined,
      stage: "new",
    });

    redirect("/ws/crm");
  }

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro eyebrow="إدارة العملاء" title="إضافة عميل جديد" description="أنشئ صفقة CRM جديدة مرتبطة بعميل وعقار اختياري." />

      <div className="mx-auto w-full max-w-2xl px-6 py-12 lg:px-10 lg:py-16">
        <form action={createClient} className="grid gap-8 rounded-3xl border border-border bg-card p-8 md:p-12 shadow-xl shadow-black/[0.02]">
          <div className="space-y-6">
            <div>
              <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">اسم العميل</label>
              <input name="name" required className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20" />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">رقم الهاتف</label>
                <input name="phone" className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20" />
              </div>
              <div>
                <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">الميزانية</label>
                <input name="budget" className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20" />
              </div>
            </div>
            <div>
              <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">موعد المتابعة</label>
              <input
                type="datetime-local"
                name="nextFollowUpAt"
                className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20"
              />
            </div>
            <div>
              <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">العقار المرتبط</label>
              <select name="propertyId" className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-bold text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20">
                <option value="">بدون عقار</option>
                {properties.page.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.title} - {property.location ?? property.address}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2.5 block text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">الوصف / الاهتمام</label>
              <textarea name="preference" rows={4} className="w-full rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 text-[15px] font-medium leading-[1.6] text-foreground outline-none transition-all focus:border-foreground/20 focus:bg-muted/20" />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row-reverse">
            <button type="submit" className="flex-1 rounded-2xl bg-foreground px-6 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-background transition-all hover:opacity-90 active:scale-[0.98] shadow-md">
              حفظ العميل
            </button>
            <Link href="/ws/crm" className="flex-1 rounded-2xl border border-border px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.98]">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createAdminKnowledgePage, deleteAdminKnowledgePage, getAdminKnowledgePageData, updateAdminKnowledgePage } from "@/admin_zone/api/knowledge";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import FormField from "@/components/shared/FormField";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatDateTime } from "@/lib/format";

type KnowledgePageProps = {
  searchParams: {
    selected?: string;
  };
};

/**
 * WHY:   Knowledge managers need one admin surface to curate the pages powering the agent.
 * WHAT:  Renders the knowledge list alongside a create-or-edit editor form — one focused two-column layout.
 * HOW:   Loads the selected document through URL state and submits CRUD operations through server actions.
 */
export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const data = await getAdminKnowledgePageData(searchParams.selected);
  const selectedPage = data.selectedPage;

  async function createKnowledgeAction(formData: FormData) {
    "use server";

    await createAdminKnowledgePage({
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      category: String(formData.get("category") ?? "").trim() || undefined,
      content: String(formData.get("content") ?? "").trim(),
    });

    revalidatePath("/knowledge");
  }

  async function updateKnowledgeAction(formData: FormData) {
    "use server";

    await updateAdminKnowledgePage({
      id: String(formData.get("id") ?? ""),
      slug: String(formData.get("slug") ?? "").trim() || undefined,
      title: String(formData.get("title") ?? "").trim() || undefined,
      category: String(formData.get("category") ?? "").trim() || undefined,
      content: String(formData.get("content") ?? "").trim() || undefined,
    });

    revalidatePath("/knowledge");
  }

  async function deleteKnowledgeAction(formData: FormData) {
    "use server";

    await deleteAdminKnowledgePage(String(formData.get("id") ?? ""));
    revalidatePath("/knowledge");
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <WorkspacePanel className="space-y-6">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            {selectedPage ? "تعديل صفحة المعرفة" : "إنشاء صفحة معرفة"}
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {selectedPage ? selectedPage.title : "مستند جديد"}
          </h2>
        </div>

        <form action={selectedPage ? updateKnowledgeAction : createKnowledgeAction} className="space-y-4">
          {selectedPage ? <input type="hidden" name="id" value={selectedPage._id} /> : null}
          <FormField label="المعرف" htmlFor="slug">
            <input id="slug" name="slug" defaultValue={selectedPage?.slug ?? ""} className="h-12 w-full border-2 border-slate-100 px-4" required />
          </FormField>
          <FormField label="العنوان" htmlFor="title">
            <input id="title" name="title" defaultValue={selectedPage?.title ?? ""} className="h-12 w-full border-2 border-slate-100 px-4" required />
          </FormField>
          <FormField label="الفئة" htmlFor="category">
            <input id="category" name="category" defaultValue={selectedPage?.category ?? ""} className="h-12 w-full border-2 border-slate-100 px-4" />
          </FormField>
          <FormField label="المحتوى" htmlFor="content">
            <textarea id="content" name="content" defaultValue={selectedPage?.content ?? ""} className="min-h-72 w-full border-2 border-slate-100 px-4 py-3" required />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="h-12 border-2 border-blue-600 bg-blue-600 px-6 text-xs font-black uppercase tracking-[0.22em] text-white">
              {selectedPage ? "تحديث" : "إنشاء"}
            </button>
            {selectedPage ? (
              <>
                <button
                  type="submit"
                  formAction={deleteKnowledgeAction}
                  className="h-12 border-2 border-rose-600 bg-white px-6 text-xs font-black uppercase tracking-[0.22em] text-rose-600"
                >
                  حذف
                </button>
                <Link href="/knowledge" className="h-12 border-2 border-slate-200 bg-white px-6 leading-[44px] text-xs font-black uppercase tracking-[0.22em] text-slate-700">
                  إلغاء
                </Link>
              </>
            ) : null}
          </div>
        </form>
      </WorkspacePanel>

      <WorkspacePanel className="space-y-6">
        {data.pages.length > 0 ? (
          <DataTable headers={["العنوان", "الفئة", "التاريخ", "تعديل"]}>
            {data.pages.map((page) => (
              <tr key={page._id} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-4">
                  <div className="text-sm font-black text-slate-900">{page.title}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{page.slug}</div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{page.category ?? "غير مصنف"}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{formatDateTime(page._creationTime)}</td>
                <td className="px-4 py-4">
                  <Link href={`/knowledge?selected=${encodeURIComponent(page._id)}`} className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="لا توجد صفحات معرفة" description="أنشئ المستند الأول لبدء قاعدة المعرفة." />
        )}
      </WorkspacePanel>
    </section>
  );
}

import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getBankById } from "@/admin_zone/mocks/data";

type EditBankPageProps = {
  params: Promise<{ bankId: string }>;
};

/**
 * WHY:   Bank detail pages need an edit route for UI-only maintenance flows.
 * WHAT:  Renders the bank editor with current values as defaults.
 * HOW:   Resolves the bank record and passes its fields into the shared entity editor.
 */
export default async function EditBankPage({ params }: EditBankPageProps) {
  const { bankId } = await params;
  const bank = getBankById(bankId);

  return (
    <EntityEditorPage
      eyebrow="التمويل والبنوك"
      title={`تعديل ${bank?.name ?? "البنك"}`}
      description="تحديث بيانات البنك وحالة إتاحة منتجاته داخل الواجهة التجريبية."
      entityLabel="البنك"
      mode="edit"
      backHref={bank ? `/banks/${bank.id}` : "/banks"}
      fields={[
        { name: "name", label: "اسم البنك", defaultValue: bank?.name ?? "" },
        { name: "slug", label: "الرمز", defaultValue: bank?.slug ?? "" },
        { name: "contactEmail", label: "البريد التشغيلي", type: "email", defaultValue: bank?.contactEmail ?? "" },
        { name: "status", label: "الحالة", type: "select", defaultValue: bank?.status ?? "active", options: [{ label: "نشط", value: "active" }, { label: "غير نشط", value: "inactive" }] },
        { name: "assistantEnabled", label: "الوصول للمساعد", type: "select", defaultValue: bank?.assistantEnabled ? "true" : "false", options: [{ label: "مفعّل", value: "true" }, { label: "غير مفعّل", value: "false" }] },
        { name: "notes", label: "ملاحظات", type: "textarea", defaultValue: bank?.notes ?? "" },
      ]}
    />
  );
}

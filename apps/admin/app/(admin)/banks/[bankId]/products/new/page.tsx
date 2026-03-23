import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getBankById } from "@/admin_zone/mocks/data";

type NewBankProductPageProps = {
  params: Promise<{ bankId: string }>;
};

/**
 * WHY:   Finance operators need a dedicated route for creating loan products under a bank.
 * WHAT:  Renders the create-bank-product form page.
 * HOW:   Uses the bank context for the title while delegating the form UI to the shared editor.
 */
export default async function NewBankProductPage({ params }: NewBankProductPageProps) {
  const { bankId } = await params;
  const bank = getBankById(bankId);

  return (
    <EntityEditorPage
      eyebrow="التمويل والبنوك"
      title={`إضافة منتج ${bank ? `إلى ${bank.name}` : ""}`}
      description="إضافة منتج تمويل جديد مع سبب الاستخدام والفائدة السنوية."
      entityLabel="المنتج البنكي"
      mode="create"
      backHref={bank ? `/banks/${bank.id}` : "/banks"}
      fields={[
        { name: "name", label: "اسم المنتج", placeholder: "قرض سكن أول" },
        { name: "reason", label: "سبب الاستخدام", placeholder: "شراء سكن أول" },
        { name: "apr", label: "الفائدة السنوية", type: "number", defaultValue: 0 },
        { name: "termYears", label: "مدة التمويل", type: "number", defaultValue: 20 },
        { name: "assistantEnabled", label: "الوصول للمساعد", type: "select", defaultValue: "true", options: [{ label: "مفعّل", value: "true" }, { label: "غير مفعّل", value: "false" }] },
      ]}
    />
  );
}

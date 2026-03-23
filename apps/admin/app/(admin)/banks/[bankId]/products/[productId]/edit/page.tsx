import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getBankById, getBankProductById } from "@/admin_zone/mocks/data";

type EditBankProductPageProps = {
  params: Promise<{ bankId: string; productId: string }>;
};

/**
 * WHY:   Bank products need a route-level editor with the current values prefilled.
 * WHAT:  Renders the edit form for one bank product.
 * HOW:   Resolves the parent bank and nested product, then forwards defaults to the shared editor.
 */
export default async function EditBankProductPage({ params }: EditBankProductPageProps) {
  const { bankId, productId } = await params;
  const bank = getBankById(bankId);
  const product = getBankProductById(bankId, productId);

  return (
    <EntityEditorPage
      eyebrow="التمويل والبنوك"
      title={`تعديل ${product?.name ?? "المنتج البنكي"}`}
      description="تحديث سبب الاستخدام، الفائدة، ومدى إتاحة المنتج للمساعد."
      entityLabel="المنتج البنكي"
      mode="edit"
      backHref={bank && product ? `/banks/${bank.id}/products/${product.id}` : bank ? `/banks/${bank.id}` : "/banks"}
      fields={[
        { name: "name", label: "اسم المنتج", defaultValue: product?.name ?? "" },
        { name: "reason", label: "سبب الاستخدام", defaultValue: product?.reason ?? "" },
        { name: "apr", label: "الفائدة السنوية", type: "number", defaultValue: product?.apr ?? 0 },
        { name: "termYears", label: "مدة التمويل", type: "number", defaultValue: product?.termYears ?? 0 },
        { name: "assistantEnabled", label: "الوصول للمساعد", type: "select", defaultValue: product?.assistantEnabled ? "true" : "false", options: [{ label: "مفعّل", value: "true" }, { label: "غير مفعّل", value: "false" }] },
      ]}
    />
  );
}

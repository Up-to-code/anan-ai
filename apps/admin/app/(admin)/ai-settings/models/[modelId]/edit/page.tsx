import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getModelById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

type EditModelPageProps = {
  params: Promise<{ modelId: string }>;
};

/**
 * WHY:   Models need an edit route with the current configuration prefilled.
 * WHAT:  Renders the edit-model page.
 * HOW:   Resolves the model by id and sends its values to the shared editor.
 */
export default async function EditModelPage({ params }: EditModelPageProps) {
  const { modelId } = await params;
  const model = getModelById(modelId);

  return (
    <EntityEditorPage
      eyebrow="إعدادات الذكاء"
      title={`تعديل ${model?.name ?? "النموذج"}`}
      description="تحديث التسعير والفريق والتوكنز في الواجهة التجريبية."
      entityLabel="النموذج"
      mode="edit"
      backHref={model ? `/ai-settings/models/${model.id}` : "/ai-settings/models"}
      tabs={aiSettingsTabs}
      fields={[
        { name: "name", label: "اسم النموذج", defaultValue: model?.name ?? "" },
        { name: "provider", label: "المزوّد", defaultValue: model?.provider ?? "" },
        { name: "team", label: "الفريق", defaultValue: model?.team ?? "" },
        { name: "status", label: "الحالة", type: "select", defaultValue: model?.status ?? "active", options: [{ label: "نشط", value: "active" }, { label: "غير نشط", value: "inactive" }] },
        { name: "monthlyTokens", label: "التوكنز الشهرية", type: "number", defaultValue: model?.monthlyTokens ?? 0 },
        { name: "burnedTokens", label: "التوكنز المحروقة", type: "number", defaultValue: model?.burnedTokens ?? 0 },
        { name: "pricePerMillion", label: "السعر لكل مليون", type: "number", defaultValue: model?.pricePerMillion ?? 0 },
      ]}
    />
  );
}

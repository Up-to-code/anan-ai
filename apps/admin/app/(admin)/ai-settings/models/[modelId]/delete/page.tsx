import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getModelById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

type DeleteModelPageProps = {
  params: Promise<{ modelId: string }>;
};

/**
 * WHY:   Models need the same delete confirmation flow as the rest of the CRUD surface.
 * WHAT:  Renders the delete-model page.
 * HOW:   Resolves the model title and passes it into the shared delete page.
 */
export default async function DeleteModelPage({ params }: DeleteModelPageProps) {
  const { modelId } = await params;
  const model = getModelById(modelId);

  return (
    <DeleteEntityPage
      eyebrow="إعدادات الذكاء"
      title="حذف نموذج"
      description="تأكيد حذف النموذج من إعدادات الذكاء التجريبية."
      entityLabel="النموذج"
      entityName={model?.name ?? "النموذج"}
      backHref={model ? `/ai-settings/models/${model.id}` : "/ai-settings/models"}
      tabs={aiSettingsTabs}
    />
  );
}

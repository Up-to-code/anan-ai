import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getKnowledgeItemById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

type DeleteKnowledgeItemPageProps = {
  params: Promise<{ itemId: string }>;
};

/**
 * WHY:   Knowledge management needs a delete confirmation route for completeness of the CRUD UI.
 * WHAT:  Renders the delete-knowledge-item page.
 * HOW:   Resolves the item label and delegates to the shared delete module.
 */
export default async function DeleteKnowledgeItemPage({ params }: DeleteKnowledgeItemPageProps) {
  const { itemId } = await params;
  const item = getKnowledgeItemById(itemId);

  return (
    <DeleteEntityPage
      eyebrow="إعدادات الذكاء"
      title="حذف عنصر معرفة"
      description="تأكيد حذف عنصر المعرفة من الواجهة التجريبية."
      entityLabel="عنصر المعرفة"
      entityName={item?.title ?? "عنصر المعرفة"}
      backHref={item ? `/ai-settings/knowledge/${item.id}` : "/ai-settings/knowledge"}
      tabs={aiSettingsTabs}
    />
  );
}

import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getKnowledgeItemById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

type EditKnowledgeItemPageProps = {
  params: Promise<{ itemId: string }>;
};

/**
 * WHY:   Knowledge review flows need a dedicated edit route for route-backed moderation changes.
 * WHAT:  Renders the edit-knowledge-item page.
 * HOW:   Resolves the item by id and passes the current values into the shared editor.
 */
export default async function EditKnowledgeItemPage({ params }: EditKnowledgeItemPageProps) {
  const { itemId } = await params;
  const item = getKnowledgeItemById(itemId);

  return (
    <EntityEditorPage
      eyebrow="إعدادات الذكاء"
      title={`تعديل ${item?.title ?? "عنصر المعرفة"}`}
      description="تحديث المعرفة المقترحة قبل قرار القبول أو الرفض."
      entityLabel="عنصر المعرفة"
      mode="edit"
      backHref={item ? `/ai-settings/knowledge/${item.id}` : "/ai-settings/knowledge"}
      tabs={aiSettingsTabs}
      fields={[
        { name: "title", label: "العنوان", defaultValue: item?.title ?? "" },
        { name: "source", label: "المصدر", defaultValue: item?.source ?? "" },
        { name: "submittedBy", label: "تم الاقتراح بواسطة", defaultValue: item?.submittedBy ?? "" },
        { name: "status", label: "الحالة", type: "select", defaultValue: item?.status ?? "pending", options: [{ label: "بانتظار القرار", value: "pending" }, { label: "مقبول", value: "accepted" }, { label: "مرفوض", value: "rejected" }] },
        { name: "summary", label: "الملخص", type: "textarea", defaultValue: item?.summary ?? "" },
      ]}
    />
  );
}

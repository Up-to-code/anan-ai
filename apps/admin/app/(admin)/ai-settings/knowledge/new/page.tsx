import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   Knowledge moderation needs a mocked create route for manually adding knowledge items.
 * WHAT:  Renders the create-knowledge-item page.
 * HOW:   Uses the shared entity editor with simple knowledge metadata fields.
 */
export default function NewKnowledgeItemPage() {
  return (
    <EntityEditorPage
      eyebrow="إعدادات الذكاء"
      title="إضافة عنصر معرفة"
      description="إضافة عنصر جديد إلى طابور المعرفة قبل اعتماده أو رفضه."
      entityLabel="عنصر المعرفة"
      mode="create"
      backHref="/ai-settings/knowledge"
      tabs={aiSettingsTabs}
      fields={[
        { name: "title", label: "العنوان", placeholder: "عنوان عنصر المعرفة" },
        { name: "source", label: "المصدر", placeholder: "اقتراح وكيل المعرفة" },
        { name: "submittedBy", label: "تم الاقتراح بواسطة", placeholder: "اسم الفريق أو المستخدم" },
        { name: "status", label: "الحالة", type: "select", defaultValue: "pending", options: [{ label: "بانتظار القرار", value: "pending" }, { label: "مقبول", value: "accepted" }, { label: "مرفوض", value: "rejected" }] },
        { name: "summary", label: "الملخص", type: "textarea", placeholder: "ملخص واضح للمعرفة المضافة." },
      ]}
    />
  );
}

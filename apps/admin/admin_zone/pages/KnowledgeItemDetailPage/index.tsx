import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getKnowledgeItemById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";

type KnowledgeItemDetailPageProps = {
  itemId: string;
};

/**
 * WHY:   Knowledge reviewers need a route-level detail page before editing or deleting proposed knowledge entries.
 * WHAT:  Renders one knowledge item with moderation metadata and management actions.
 * HOW:   Resolves the item from the mock repository and shows it inside the shared admin detail layout.
 */
export default function KnowledgeItemDetailPage({ itemId }: KnowledgeItemDetailPageProps) {
  const item = getKnowledgeItemById(itemId);

  if (!item) {
    return <EmptyState title="العنصر غير موجود" description="تعذر العثور على عنصر المعرفة المطلوب." />;
  }

  return (
    <SectionScaffold
      eyebrow="إعدادات الذكاء"
      title={item.title}
      description={item.summary}
      tabs={aiSettingsTabs}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/ai-settings/knowledge/${item.id}/edit` },
            { label: "حذف", href: `/ai-settings/knowledge/${item.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge value={item.status} />
        </div>
        <KeyValueGrid
          items={[
            { label: "المصدر", value: item.source },
            { label: "تم الاقتراح بواسطة", value: item.submittedBy },
            { label: "الحالة", value: <StatusBadge value={item.status} /> },
            { label: "المعرّف", value: item.id },
          ]}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}

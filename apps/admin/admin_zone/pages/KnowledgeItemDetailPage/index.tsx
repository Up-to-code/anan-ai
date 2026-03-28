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
      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
        <div className="flex items-center justify-between pb-8 border-b border-border/10">
          <div className="space-y-3">
            <h3 className="text-4xl font-black tracking-tighter text-foreground decoration-primary/20 underline decoration-8 underline-offset-8 decoration-skip-ink-none">{item.title}</h3>
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">{item.source}</p>
          </div>
          <StatusBadge value={item.status} />
        </div>

        <KeyValueGrid
          items={[
            { label: "المصدر الأصلي", value: <span className="font-black text-foreground">{item.source}</span> },
            { label: "تم الاقتراح بواسطة", value: <span className="font-black text-primary">{item.submittedBy}</span> },
            { label: "الحالة الحالية", value: <StatusBadge value={item.status} /> },
            { label: "المعرّف الفريد", value: <span className="font-mono text-[11px] text-muted-foreground/50">{item.id}</span> },
          ]}
          columns={2}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}

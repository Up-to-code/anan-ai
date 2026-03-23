import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getModelById } from "@/admin_zone/mocks/data";
import { aiSettingsTabs } from "@/lib/adminSectionTabs";
import { formatNumber } from "@/lib/format";

type ModelDetailPageProps = {
  modelId: string;
};

/**
 * WHY:   AI operations need a direct model-level view before changing pricing, routing, or deleting a model entry.
 * WHAT:  Renders one model record with token and pricing metadata plus CRUD actions.
 * HOW:   Looks up the model in the mock repository and renders a compact information grid.
 */
export default function ModelDetailPage({ modelId }: ModelDetailPageProps) {
  const model = getModelById(modelId);

  if (!model) {
    return <EmptyState title="النموذج غير موجود" description="تعذر العثور على النموذج المطلوب." />;
  }

  return (
    <SectionScaffold
      eyebrow="إعدادات الذكاء"
      title={model.name}
      description="تفاصيل النموذج، الفريق المرتبط، واستهلاك التوكنز داخل الواجهة التجريبية."
      tabs={aiSettingsTabs}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/ai-settings/models/${model.id}/edit` },
            { label: "حذف", href: `/ai-settings/models/${model.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge value={model.status} />
        </div>
        <KeyValueGrid
          items={[
            { label: "المزوّد", value: model.provider },
            { label: "الفريق", value: model.team },
            { label: "التوكنز الشهرية", value: formatNumber(model.monthlyTokens) },
            { label: "التوكنز المحروقة", value: formatNumber(model.burnedTokens) },
            { label: "السعر لكل مليون", value: `$${model.pricePerMillion}` },
            { label: "المعرّف", value: model.id },
          ]}
          columns={3}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}

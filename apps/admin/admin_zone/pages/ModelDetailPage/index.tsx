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
      eyebrow="إعدادات الذكاء الاصطناعي"
      title={model.name}
      description="تفاصيل النموذج، الفريق المرتبط، واستهلاك التوكنز داخل النظام بصورة مباشرة."
      tabs={aiSettingsTabs}
      actions={
        <PageActions
          actions={[
            { label: "تعديل النموذج", href: `/ai-settings/models/${model.id}/edit` },
            { label: "حذف", href: `/ai-settings/models/${model.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
        <div className="flex items-center justify-between pb-8 border-b border-border/10">
          <div className="space-y-3">
            <h3 className="text-4xl font-black tracking-tighter text-foreground decoration-primary/20 underline decoration-8 underline-offset-8 decoration-skip-ink-none">{model.name}</h3>
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">Model Identifier: {model.id}</p>
          </div>
          <StatusBadge value={model.status} />
        </div>

        <div className="grid gap-8">
          <KeyValueGrid
            items={[
              { label: "المزوّد التقني", value: <span className="font-black text-foreground">{model.provider}</span> },
              { label: "فريق العمل", value: <span className="font-black text-primary">{model.team}</span> },
              { label: "التوكنز الشهرية", value: <span className="font-black text-foreground">{formatNumber(model.monthlyTokens)}</span> },
              { label: "التوكنز المستهلكة", value: <span className="font-black text-destructive">{formatNumber(model.burnedTokens)}</span> },
              { label: "سعر المليون توكن", value: <span className="font-black text-foreground">${model.pricePerMillion}</span> },
            ]}
            columns={2}
          />
        </div>
      </WorkspacePanel>
    </SectionScaffold>
  );
}

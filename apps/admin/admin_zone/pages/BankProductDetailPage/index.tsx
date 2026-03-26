import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getBankById, getBankProductById } from "@/admin_zone/mocks/data";

type BankProductDetailPageProps = {
  bankId: string;
  productId: string;
};

/**
 * WHY:   Bank products need their own drill-down route so finance admins can review and manage a loan product directly.
 * WHAT:  Renders one bank product with bank context and CRUD actions.
 * HOW:   Resolves the parent bank plus nested product from the mock repository and shows a compact metadata grid.
 */
export default function BankProductDetailPage({ bankId, productId }: BankProductDetailPageProps) {
  const bank = getBankById(bankId);
  const product = getBankProductById(bankId, productId);

  if (!bank || !product) {
    return <EmptyState title="المنتج غير موجود" description="لا توجد بيانات mock لهذا المنتج البنكي." />;
  }

  return (
    <SectionScaffold
      eyebrow="التمويل والبنوك"
      title={product.name}
      description={`منتج تابع لـ ${bank.name} ويمكن استخدامه داخل واجهات التمويل والمساعد.`}
      actions={
        <PageActions
          actions={[
            { label: "تعديل", href: `/banks/${bank.id}/products/${product.id}/edit` },
            { label: "حذف", href: `/banks/${bank.id}/products/${product.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
        <div className="flex items-center justify-between pb-8 border-b border-border/10">
          <div className="space-y-3">
            <h3 className="text-4xl font-black tracking-tighter text-foreground decoration-primary/20 underline decoration-8 underline-offset-8 decoration-skip-ink-none">{product.name}</h3>
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">Product ID: {product.id}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={product.assistantEnabled ? "active" : "inactive"} />
            <StatusBadge value={bank.status} />
          </div>
        </div>

        <KeyValueGrid
          items={[
            { label: "البنك الشريك", value: <span className="font-black text-foreground">{bank.name}</span> },
            { label: "سبب التفضيل", value: <span className="font-bold text-muted-foreground/80">{product.reason}</span> },
            { label: "الفائدة السنوية", value: <span className="font-black text-primary">{product.apr}%</span> },
            { label: "مدة التمويل", value: <span className="font-black text-foreground">{product.termYears} سنة</span> },
            { label: "المعرّف التقني", value: <span className="font-mono text-[11px] text-muted-foreground/50">{product.id}</span> },
          ]}
          columns={3}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}

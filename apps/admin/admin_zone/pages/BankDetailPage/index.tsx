import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getBankById } from "@/admin_zone/mocks/data";

type BankDetailPageProps = {
  bankId: string;
};

/**
 * WHY:   Finance admins need a dedicated bank detail page for product-level review.
 * WHAT:  Renders one bank and its financing products from the mock catalog.
 * HOW:   Resolves the bank by id and maps its nested products into simple product cards.
 */
export default function BankDetailPage({ bankId }: BankDetailPageProps) {
  const bank = getBankById(bankId);

  if (!bank) {
    return <EmptyState title="البنك غير موجود" description="لا توجد بيانات mock لهذا البنك." />;
  }

  return (
    <SectionScaffold
      eyebrow="التمويل والبنوك"
      title={bank.name}
      description={bank.notes}
      actions={
        <PageActions
          actions={[
            { label: "إضافة منتج", href: `/banks/${bank.id}/products/new` },
            { label: "تعديل البنك", href: `/banks/${bank.id}/edit`, variant: "outline" },
            { label: "حذف البنك", href: `/banks/${bank.id}/delete`, variant: "outline" },
          ]}
        />
      }
    >
      <WorkspacePanel className="rounded-3xl p-10 space-y-10 border-border/30 bg-card/50 shadow-sm">
        <div className="flex items-center justify-between pb-8 border-b border-border/10">
          <div className="space-y-3">
            <h3 className="text-4xl font-black tracking-tighter text-foreground decoration-primary/20 underline decoration-8 underline-offset-8 decoration-skip-ink-none">{bank.name}</h3>
            <p className="text-[13px] font-bold text-muted-foreground/40 uppercase tracking-widest">{bank.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={bank.status} />
            <StatusBadge value={bank.assistantEnabled ? "active" : "inactive"} />
          </div>
        </div>

        <KeyValueGrid
          items={[
            { label: "البريد التشغيلي", value: <span className="font-black text-foreground">{bank.contactEmail}</span> },
            { label: "الوصول للمساعد", value: <span className="font-bold text-primary">{bank.assistantEnabled ? "مفعّل" : "غير مفعّل"}</span> },
            { label: "عدد المنتجات", value: <span className="font-black text-foreground">{bank.products.length}</span> },
          ]}
          columns={3}
        />
      </WorkspacePanel>

      <WorkspacePanel className="rounded-3xl p-10 space-y-8 border-border/30 bg-card/30">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-foreground">منتجات التمويل</h2>
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">{bank.products.length} Products Available</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {bank.products.map((product) => (
            <div key={product.id} className="group rounded-2xl border border-border/40 bg-background p-6 transition-all hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center justify-between gap-3 mb-4">
                <Link href={`/banks/${bank.id}/products/${product.id}`} className="text-lg font-black tracking-tight text-foreground hover:text-primary transition-colors">
                  {product.name}
                </Link>
                <StatusBadge value={product.assistantEnabled ? "active" : "inactive"} />
              </div>
              <p className="text-[13px] text-muted-foreground/70 leading-relaxed mb-6">{product.reason}</p>
              
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/5 mb-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">الربح السنوي</div>
                  <div className="font-black text-foreground">{product.apr}%</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">المدة القصوى</div>
                  <div className="font-black text-foreground">{product.termYears} سنة</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border/5">
                <Link href={`/banks/${bank.id}/products/${product.id}/edit`} className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-colors">تعديل المنتج</Link>
                <Link href={`/banks/${bank.id}/products/${product.id}/delete`} className="text-[11px] font-black uppercase tracking-widest text-destructive/60 hover:text-destructive transition-colors">حذف</Link>
              </div>
            </div>
          ))}
        </div>
      </WorkspacePanel>
    </SectionScaffold>
  );
}

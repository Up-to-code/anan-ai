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
      <WorkspacePanel className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge value={product.assistantEnabled ? "active" : "inactive"} />
          <StatusBadge value={bank.status} />
        </div>
        <KeyValueGrid
          items={[
            { label: "البنك", value: bank.name },
            { label: "سبب الاستخدام", value: product.reason },
            { label: "الفائدة السنوية", value: `${product.apr}%` },
            { label: "مدة التمويل", value: `${product.termYears} سنة` },
            { label: "الوصول للمساعد", value: product.assistantEnabled ? "متاح" : "غير متاح" },
            { label: "المعرّف", value: product.id },
          ]}
          columns={3}
        />
      </WorkspacePanel>
    </SectionScaffold>
  );
}

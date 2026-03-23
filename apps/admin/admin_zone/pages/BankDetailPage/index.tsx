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
      <WorkspacePanel className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge value={bank.status} />
          <StatusBadge value={bank.assistantEnabled ? "active" : "inactive"} />
        </div>
        <KeyValueGrid
          items={[
            { label: "البريد التشغيلي", value: bank.contactEmail },
            { label: "الرمز", value: bank.slug },
            { label: "الوصول للمساعد", value: bank.assistantEnabled ? "مفعّل" : "غير مفعّل" },
            { label: "عدد المنتجات", value: bank.products.length },
          ]}
        />
      </WorkspacePanel>

      <WorkspacePanel className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">منتجات البنك</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {bank.products.map((product) => (
            <div key={product.id} className="rounded-[8px] border border-border bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <Link href={`/banks/${bank.id}/products/${product.id}`} className="font-medium text-slate-900 hover:underline">
                  {product.name}
                </Link>
                <StatusBadge value={product.assistantEnabled ? "active" : "inactive"} />
              </div>
              <div className="mt-2 text-sm text-slate-600">{product.reason}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div>الربح السنوي: {product.apr}%</div>
                <div>المدة: {product.termYears} سنة</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/banks/${bank.id}/products/${product.id}/edit`} className="text-sm text-slate-700 underline-offset-2 hover:underline">تعديل</Link>
                <Link href={`/banks/${bank.id}/products/${product.id}/delete`} className="text-sm text-slate-700 underline-offset-2 hover:underline">حذف</Link>
              </div>
            </div>
          ))}
        </div>
      </WorkspacePanel>
    </SectionScaffold>
  );
}

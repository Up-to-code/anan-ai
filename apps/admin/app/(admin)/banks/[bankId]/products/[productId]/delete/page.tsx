import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getBankById, getBankProductById } from "@/admin_zone/mocks/data";

type DeleteBankProductPageProps = {
  params: Promise<{ bankId: string; productId: string }>;
};

/**
 * WHY:   Loan products need the same explicit delete confirmation flow as other managed entities.
 * WHAT:  Renders the bank-product delete confirmation page.
 * HOW:   Resolves the nested product and uses its title as the confirmation target.
 */
export default async function DeleteBankProductPage({ params }: DeleteBankProductPageProps) {
  const { bankId, productId } = await params;
  const bank = getBankById(bankId);
  const product = getBankProductById(bankId, productId);

  return (
    <DeleteEntityPage
      eyebrow="التمويل والبنوك"
      title="حذف منتج بنكي"
      description="تأكيد حذف المنتج من البنك داخل الواجهة التجريبية."
      entityLabel="المنتج البنكي"
      entityName={product?.name ?? "المنتج البنكي"}
      backHref={bank && product ? `/banks/${bank.id}/products/${product.id}` : bank ? `/banks/${bank.id}` : "/banks"}
    />
  );
}

import BankProductDetailPage from "@/admin_zone/pages/BankProductDetailPage";

type BankProductPageProps = {
  params: Promise<{ bankId: string; productId: string }>;
};

/**
 * WHY:   Loan products need a route-backed detail screen for review and management actions.
 * WHAT:  Renders the bank-product detail page.
 * HOW:   Delegates the dynamic params directly to the bank product detail module.
 */
export default async function BankProductPage({ params }: BankProductPageProps) {
  const { bankId, productId } = await params;
  return <BankProductDetailPage bankId={bankId} productId={productId} />;
}

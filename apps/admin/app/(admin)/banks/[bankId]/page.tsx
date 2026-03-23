import BankDetailPage from "@/admin_zone/pages/BankDetailPage";

type BankDetailRouteProps = {
  params: Promise<{ bankId: string }>;
};

/**
 * WHY:   The bank detail route should only resolve and forward the bank id.
 * WHAT:  Renders the mocked bank detail page.
 * HOW:   Awaits the dynamic `bankId` segment and forwards it to the page module.
 */
export default async function BankDetailRoute({ params }: BankDetailRouteProps) {
  const { bankId } = await params;
  return <BankDetailPage bankId={bankId} />;
}


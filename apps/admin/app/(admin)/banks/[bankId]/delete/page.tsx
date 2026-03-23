import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getBankById } from "@/admin_zone/mocks/data";

type DeleteBankPageProps = {
  params: Promise<{ bankId: string }>;
};

/**
 * WHY:   Bank management needs an explicit confirmation route for deletions.
 * WHAT:  Renders the delete-bank page.
 * HOW:   Resolves the bank display name and delegates to the shared delete module.
 */
export default async function DeleteBankPage({ params }: DeleteBankPageProps) {
  const { bankId } = await params;
  const bank = getBankById(bankId);

  return (
    <DeleteEntityPage
      eyebrow="التمويل والبنوك"
      title="حذف بنك"
      description="تأكيد حذف البنك من الكتالوج التجريبي."
      entityLabel="البنك"
      entityName={bank?.name ?? "البنك"}
      backHref={bank ? `/banks/${bank.id}` : "/banks"}
    />
  );
}

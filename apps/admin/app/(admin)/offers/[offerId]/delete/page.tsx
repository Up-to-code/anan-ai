import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getOfferById } from "@/admin_zone/mocks/data";
import { offerDetailTabs, offersTabs } from "@/lib/adminSectionTabs";

type DeleteOfferPageProps = {
  params: Promise<{ offerId: string }>;
};

/**
 * WHY:   Offer CRUD needs the same delete confirmation pattern as the rest of the admin entities.
 * WHAT:  Renders the delete-offer page.
 * HOW:   Uses the offer id to resolve the title and return path.
 */
export default async function DeleteOfferPage({ params }: DeleteOfferPageProps) {
  const { offerId } = await params;
  const offer = getOfferById(offerId);

  return (
    <DeleteEntityPage
      eyebrow="إدارة العروض"
      title="حذف عرض"
      description="تأكيد حذف العرض من قائمة المراجعة التجريبية."
      entityLabel="العرض"
      entityName={offer?.title ?? "العرض"}
      backHref={offer ? `/offers/${offer.id}` : "/offers"}
      tabs={offer ? offerDetailTabs(offer.id) : offersTabs}
    />
  );
}

import EmptyState from "@/components/shared/EmptyState";
import { getOfferById } from "@/admin_zone/mocks/data";
import OfferDetailPageClient from "./OfferDetailPageClient";

type OfferDetailPageProps = {
  offerId: string;
};

/**
 * WHY:   The offer detail route must resolve one offer and hand it to the mocked review UI.
 * WHAT:  Loads a single offer by id and renders the detail page.
 * HOW:   Falls back to an empty state when the requested offer does not exist in the repository.
 */
export default function OfferDetailPage({ offerId }: OfferDetailPageProps) {
  const offer = getOfferById(offerId);

  if (!offer) {
    return <EmptyState title="العرض غير موجود" description="تعذر العثور على العرض المطلوب في بيانات mock." />;
  }

  return <OfferDetailPageClient offer={offer} />;
}


import type { OfferSummary } from "@/server/contracts/offers";
import type { PropertyDetail } from "@/server/contracts/properties";
import type { OfferMarketplaceItem } from "./offerTypes";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export function mapOfferToMarketplaceItem(offer: OfferSummary): OfferMarketplaceItem {
  const kind = offer.senderName?.includes("شركة") ? "developer" : "broker";

  return {
    id: offer.id,
    title: offer.message ?? offer.description ?? offer.property?.title ?? "عرض جديد",
    kind,
    image:
      offer.property?.imageUrl ??
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    location: offer.property?.address ?? "غير محدد",
    priceLabel: `${formatCurrency(offer.price)} ر.س`,
    propertyType: offer.visibility === "public" ? "عرض عام" : "عرض خاص",
    ownerLabel: offer.senderName ?? "صاحب العرض",
    summary: offer.description ?? offer.message ?? "لا يوجد وصف إضافي.",
    project: {
      id: offer.property?.id ?? offer.propertyId,
      title: offer.property?.title ?? "عقار مرتبط",
      rooms: "غير محدد",
      baths: "غير محدد",
      area: "غير محدد",
    },
    projectRefId: offer.property?.id ?? offer.propertyId,
    unit: null,
    broker: null,
    demandLabel: offer.visibility === "public" ? "متاح في السوق" : null,
  };
}

export function mapPropertyToOfferOption(property: PropertyDetail) {
  return {
    id: property._id,
    title: property.title,
    location: property.location ?? property.address,
    image:
      property.heroImage?.url ??
      property.media?.[0]?.url ??
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    expectedPrice: String(property.price),
  };
}

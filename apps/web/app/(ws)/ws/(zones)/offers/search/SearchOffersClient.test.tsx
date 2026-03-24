import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SearchOffersClient, { filterSearchOffers } from "./SearchOffersClient";
import type { OfferMarketplaceItem } from "../offerTypes";

const SAMPLE_ITEMS: OfferMarketplaceItem[] = [
  {
    id: "offer-1",
    title: "عرض في الرياض",
    kind: "developer",
    image: "https://example.com/offer-1.jpg",
    location: "الرياض",
    priceLabel: "1,200,000 ر.س",
    propertyType: "عرض عام",
    ownerLabel: "شركة النخبة",
    summary: "تفاصيل العرض الأول",
    project: {
      id: "project-1",
      title: "المشروع الأول",
      rooms: "3",
      baths: "2",
      area: "120",
    },
    projectRefId: "project-1",
    unit: null,
    broker: null,
    demandLabel: null,
  },
  {
    id: "offer-2",
    title: "عرض في جدة",
    kind: "broker",
    image: "https://example.com/offer-2.jpg",
    location: "جدة",
    priceLabel: "900,000 ر.س",
    propertyType: "عرض خاص",
    ownerLabel: "وسيط جدة",
    summary: "تفاصيل العرض الثاني",
    project: {
      id: "project-2",
      title: "المشروع الثاني",
      rooms: "2",
      baths: "2",
      area: "95",
    },
    projectRefId: "project-2",
    unit: null,
    broker: null,
    demandLabel: null,
  },
];

describe("SearchOffersClient", () => {
  it("filters offers by city, type, and kind", () => {
    const filtered = filterSearchOffers(SAMPLE_ITEMS, {
      searchQuery: "",
      filterCity: "جدة",
      filterType: "عرض خاص",
      filterKind: "broker",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("offer-2");
  });

  it("renders normalized grid cards", () => {
    const markup = renderToStaticMarkup(<SearchOffersClient items={SAMPLE_ITEMS} />);
    expect(markup).toContain("data-slot=\"offers-grid\"");
    expect(markup).toContain("عرض في الرياض");
    expect(markup).toContain("شركة النخبة");
  });
});


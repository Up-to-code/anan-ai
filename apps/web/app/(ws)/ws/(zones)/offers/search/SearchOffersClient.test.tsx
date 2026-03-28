import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SearchOffersClient, { filterSearchOffers } from "./SearchOffersClient";
import type { WorkspaceOfferSummary } from "../offerTypes";

const SAMPLE_ITEMS: WorkspaceOfferSummary[] = [
  {
    id: "offer-1",
    packageId: "package-1",
    type: "open_offer",
    stage: "open",
    status: "pending",
    publicationState: "published",
    visibility: "public",
    propertyId: "project-1",
    price: 1200000,
    message: "عرض في الرياض",
    description: "تفاصيل العرض الأول",
    senderName: "شركة النخبة",
    recipientAuthUserId: null,
    sourceConversationId: null,
    property: {
      id: "project-1",
      title: "المشروع الأول",
      address: "الرياض",
      imageUrl: "https://example.com/offer-1.jpg",
    },
    commissionText: null,
    permitStatus: null,
    productStatus: null,
    allowedAudience: "both",
    attachments: [],
    clientContext: null,
    participants: [],
    href: "/ws/offers/offer-1",
    createdAt: 1,
    updatedAt: 1,
  },
  {
    id: "offer-2",
    packageId: "package-2",
    type: "private_offer",
    stage: "targeted",
    status: "pending",
    publicationState: "published",
    visibility: "private",
    propertyId: "project-2",
    price: 900000,
    message: "عرض في جدة",
    description: "تفاصيل العرض الثاني",
    senderName: "وسيط جدة",
    recipientAuthUserId: null,
    sourceConversationId: null,
    property: {
      id: "project-2",
      title: "المشروع الثاني",
      address: "جدة",
      imageUrl: "https://example.com/offer-2.jpg",
    },
    commissionText: null,
    permitStatus: null,
    productStatus: null,
    allowedAudience: "brokers",
    attachments: [],
    clientContext: null,
    participants: [],
    href: "/ws/offers/offer-2",
    createdAt: 1,
    updatedAt: 1,
  },
];

describe("SearchOffersClient", () => {
  it("filters offers by free-text across message, property, and sender name", () => {
    const filtered = filterSearchOffers(SAMPLE_ITEMS, {
      searchQuery: "جدة",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("offer-2");
  });

  it("renders normalized grid cards", () => {
    const markup = renderToStaticMarkup(<SearchOffersClient items={SAMPLE_ITEMS} />);
    expect(markup).toContain("data-slot=\"offers-grid\"");
    expect(markup).toContain("عرض في الرياض");
    expect(markup).toContain("شركة النخبة");
    expect(markup).toContain("1,200,000");
  });
});

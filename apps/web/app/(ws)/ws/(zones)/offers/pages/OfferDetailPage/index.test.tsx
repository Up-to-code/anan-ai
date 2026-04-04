import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

const router = {
  push: vi.fn(),
  refresh: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

import OfferDetailPage from "./index";

const baseOffer = {
  id: "offer-1",
  packageId: "package-1",
  type: "private_offer" as const,
  stage: "targeted" as const,
  status: "pending" as const,
  publicationState: "published" as const,
  visibility: "private" as const,
  propertyId: "property-1",
  price: 2500000,
  message: "عرض تطويري خاص",
  description: "وصف واضح ومباشر.",
  senderName: "شركة ألف للتطوير",
  recipientAuthUserId: null,
  sourceConversationId: null,
  property: {
    id: "property-1",
    title: "مالقا ريزيدنس",
    address: "الملقا، الرياض",
    price: 2500000,
    beds: 3,
    baths: 3,
    sqft: 185,
    location: "الرياض",
    area: "الملقا",
    imageUrl: null,
  },
  propertyGallery: [
    "https://example.com/gallery-1.jpg",
    "https://example.com/gallery-2.jpg",
  ],
  propertySummary: "واجهة هادئة مع نبذة قصيرة.",
  commissionText: "2.5%",
  permitStatus: "جاهز",
  productStatus: "متاح",
  allowedAudience: "both" as const,
  attachments: [],
  clientContext: null,
  primaryOrganization: {
    id: "red-1",
    name: "شركة ألف للتطوير",
    type: "developer" as const,
    logoUrl: null,
    website: "https://example.com",
    contactEmail: "offers@example.com",
  },
  participants: [],
  href: "/ws/offers/offer-1",
  createdAt: 1,
  updatedAt: 1,
  propertyTitle: "مالقا ريزيدنس",
  propertyAddress: "الملقا، الرياض",
  propertyImageUrl: null,
  isOwner: false,
  isRecipient: true,
  canEditDraft: false,
  canPublish: false,
  canArchive: false,
  canRespond: true,
  allowedActions: {
    isInventoryOwner: false,
    isClientOwner: false,
    isExecutionPartner: true,
    canEditDraft: false,
    canPublish: false,
    canArchive: false,
    canEngage: false,
    canRespond: true,
    canMarkAgreed: false,
    canCloseWon: false,
    canCloseLost: false,
  },
  activity: [
    {
      id: "activity-1",
      kind: "participant_targeted" as const,
      message: "تمت مشاركة الحالة",
      createdAt: Date.UTC(2025, 0, 1),
      actorName: "أحمد",
    },
  ],
};

describe("OfferDetailPage", () => {
  it("renders the simplified property-first detail layout with brand actions", () => {
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        <OfferDetailPage
          offer={baseOffer}
          onMessage={async () => ({ conversationId: "conversation-1" })}
          onRespond={async () => ({ ok: true })}
        />
      </WebLocaleProvider>,
    );

    expect(markup).toContain("شركة ألف للتطوير");
    expect(markup).toContain("offers@example.com");
    expect(markup).toContain("واجهة هادئة مع نبذة قصيرة.");
    expect(markup).toContain("مالقا ريزيدنس");
    expect(markup).toContain("عرض تطويري خاص");
    expect(markup).toContain("تاريخ العمليات");
    expect(markup).toContain("data-slot=\"offer-gallery\"");
    expect(markup).toContain("data-slot=\"offer-detail-sidebar\"");
    expect(markup).toContain("data-slot=\"offer-detail-hero\"");
    expect(markup).toContain("تفاصيل العقار");
    expect(markup).toContain("معرض الصور");
    expect(markup).toContain("الوصف الكامل");
    expect(markup).toContain("3 غرف");
    expect(markup).toContain("185 م²");
  });

  it("renders client-specific data as the primary structured block when client context exists", () => {
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        <OfferDetailPage
          offer={{
            ...baseOffer,
            message: "باحث عن شقة جاهزة",
            clientContext: {
              clientName: "باحث عن شقة جاهزة",
              clientNeed: "شقة جاهزة في شمال الرياض\nالموقع المطلوب: شمال الرياض",
              clientBudget: "2,700,000 ر.س",
              area: "الملقا",
              bedsMin: 3,
              bathsMin: 3,
              sqftMin: 180,
              sqftMax: 220,
              clientPhone: "+966500000000",
            },
          }}
          onMessage={async () => ({ conversationId: "conversation-1" })}
          onRespond={async () => ({ ok: true })}
        />
      </WebLocaleProvider>,
    );

    expect(markup).toContain("باحث عن شقة جاهزة");
    expect(markup).toContain("شقة جاهزة في شمال الرياض");
    expect(markup).toContain("2,700,000 ر.س");
    expect(markup).toContain("الموقع");
    expect(markup).toContain("شمال الرياض");
    expect(markup).toContain("المنطقة");
    expect(markup).toContain("الملقا");
    expect(markup).toContain("الغرف");
    expect(markup).toContain("3+");
    expect(markup).toContain("الحمامات");
    expect(markup).toContain("المساحة");
    expect(markup).toContain("180-220 m²");
    expect(markup).toContain("+966500000000");
    expect(markup).not.toContain("data-slot=\"offer-gallery\"");
  });

  it("renders the detail page copy in English when the workspace locale changes", () => {
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="en" dictionary={getWebDictionary("en")}>
        <OfferDetailPage
          offer={baseOffer}
          onMessage={async () => ({ conversationId: "conversation-1" })}
          onRespond={async () => ({ ok: true })}
        />
      </WebLocaleProvider>,
    );

    expect(markup).toContain("Back to offers");
    expect(markup).toContain("Open conversation");
    expect(markup).toContain("Published by");
    expect(markup).toContain("Property details");
    expect(markup).toContain("Gallery");
    expect(markup).toContain("Full description");
    expect(markup).toContain("Activity log");
    expect(markup).toContain("3 rooms");
    expect(markup).toContain("2,500,000 SAR");
  });
});

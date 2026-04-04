import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import OfferListItem from "./OfferListItem";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe("OfferListItem", () => {
  it("shows structured client requirement details for collaboration cases", () => {
    const markup = renderToStaticMarkup(
      <OfferListItem
        item={{
          id: "offer-1",
          packageId: "package-1",
          type: "collaboration_case",
          stage: "open",
          status: "pending",
          publicationState: "published",
          visibility: "public",
          propertyId: null,
          price: 2700000,
          message: "باحث عن شقة جاهزة",
          description: "احتياج واضح للشراء السريع.",
          senderName: "وسيط النخبة",
          recipientAuthUserId: null,
          sourceConversationId: null,
          property: null,
          propertyGallery: [],
          propertySummary: null,
          commissionText: null,
          permitStatus: null,
          productStatus: null,
          allowedAudience: "brokers",
          attachments: [],
          clientContext: {
            clientName: "باحث عن شقة جاهزة",
            clientNeed: "شقة جاهزة في شمال الرياض\nالموقع المطلوب: شمال الرياض",
            clientBudget: "2,700,000 ر.س",
            area: "الملقا",
            bedsMin: 3,
            bathsMin: 3,
            sqftMin: 180,
            sqftMax: 220,
            clientPhone: null,
          },
          primaryOrganization: {
            id: "broker-1",
            name: "وسيط النخبة",
            type: "broker",
            logoUrl: null,
            website: null,
            contactEmail: null,
            phone: null,
          },
          participants: [],
          href: "/ws/offers/offer-1",
          createdAt: 1,
          updatedAt: 1,
        }}
      />,
    );

    expect(markup).toContain("باحث عن شقة جاهزة");
    expect(markup).toContain("شقة جاهزة في شمال الرياض");
    expect(markup).toContain("الميزانية");
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
  });
});

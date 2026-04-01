import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import OfferOverviewPage from "./index";

const item = {
  id: "offer-1",
  packageId: "package-1",
  type: "open_offer" as const,
  stage: "open" as const,
  status: "pending" as const,
  publicationState: "published" as const,
  visibility: "public" as const,
  propertyId: "property-1",
  price: 2500000,
  message: "عرض تطويري مفتوح",
  description: "عرض مرتب وواضح ومختصر لهذه القائمة.",
  senderName: "شركة ألف للتطوير",
  recipientAuthUserId: null,
  sourceConversationId: null,
  property: {
    id: "property-1",
    title: "مالقا ريزيدنس",
    address: "الملقا، الرياض",
    imageUrl: null,
  },
  propertyGallery: [],
  propertySummary: "واجهة سكنية هادئة مع وصف مختصر.",
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
};

describe("OfferOverviewPage", () => {
  it("renders the flat list layout with organization actions", () => {
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        <OfferOverviewPage
          items={[item]}
          pagination={{
            items: [item],
            page: 1,
            pageCount: 1,
            totalItems: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          }}
          routeBase="/ws/offers"
          searchQuery=""
          sort="updated_desc"
          filters={{ area: "", location: "" }}
        />
      </WebLocaleProvider>,
    );

    expect(markup).toContain("العروض");
    expect(markup).toContain("data-slot=\"offers-grid\"");
    expect(markup).toContain("شركة ألف للتطوير");
    expect(markup).toContain("offers@example.com");
    expect(markup).toContain("مالقا ريزيدنس");
    expect(markup).toContain("الأحدث أولاً");
    expect(markup).not.toContain("Open Inventory Offers");
  });

  it("falls back cleanly when organization contact data is missing", () => {
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        <OfferOverviewPage
          items={[
            {
              ...item,
              primaryOrganization: {
                id: "red-1",
                name: "شركة ألف للتطوير",
                type: "developer" as const,
                logoUrl: null,
                website: null,
                contactEmail: null,
              },
              propertySummary: null,
            },
          ]}
          pagination={{
            items: [
              {
                ...item,
                primaryOrganization: {
                  id: "red-1",
                  name: "شركة ألف للتطوير",
                  type: "developer" as const,
                  logoUrl: null,
                  website: null,
                  contactEmail: null,
                },
                propertySummary: null,
              },
            ],
            page: 1,
            pageCount: 1,
            totalItems: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          }}
          routeBase="/ws/offers"
          searchQuery="الرياض"
          sort="updated_asc"
          filters={{ area: "", location: "الرياض" }}
        />
      </WebLocaleProvider>,
    );

    expect(markup).toContain("شركة ألف للتطوير");
    expect(markup).toContain("فتح التفاصيل");
    expect(markup).toContain("نتائج البحث: الرياض");
    expect(markup).toContain("الأقدم أولاً");
    expect(markup).not.toContain("offers@example.com");
  });
});

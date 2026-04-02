import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

vi.mock("next/navigation", () => ({
  usePathname: () => "/ws/offers",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({ audience: "developer", ownerContext: undefined })),
}));

const getSnapshot = vi.fn(async () => ({
  audience: "developer" as const,
  queues: [
    {
      key: "open_inventory" as const,
      label: "Open Inventory Offers",
      description: "Developer-owned inventory packages currently open.",
      items: [
        {
          id: "offer-1",
          packageId: "package-1",
          type: "open_offer" as const,
          stage: "open" as const,
          status: "pending" as const,
          publicationState: "published" as const,
          visibility: "public" as const,
          propertyId: "property-1",
          price: 2500000,
          message: "عرض مكرر محدث",
          description: "عرض مطور مفتوح",
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
            sqft: 190,
            location: "الرياض",
            area: "الملقا",
            imageUrl: "https://images.unsplash.com/photo-offer",
          },
          propertyGallery: ["https://images.unsplash.com/photo-offer"],
          propertySummary: "واجهة سكنية هادئة مع نبذة قصيرة وواضحة.",
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
            logoUrl: "https://example.com/logo.png",
            website: "https://example.com",
            contactEmail: "offers@example.com",
          },
          participants: [
            {
              id: "participant-1",
              role: "inventory_owner" as const,
              status: "active" as const,
              authUserId: "auth-1",
              organizationId: "red-1",
              organizationType: "developer" as const,
              organizationName: "شركة ألف للتطوير",
              name: "شركة ألف للتطوير",
            },
          ],
          href: "/ws/offers/offer-1",
          createdAt: 1,
          updatedAt: 10,
        },
        {
          id: "offer-2",
          packageId: "package-2",
          type: "private_offer" as const,
          stage: "targeted" as const,
          status: "pending" as const,
          publicationState: "published" as const,
          visibility: "private" as const,
          propertyId: "property-2",
          price: 1800000,
          message: "عرض ثانٍ",
          description: "عرض وسيط خاص",
          senderName: "وسيط الرياض",
          recipientAuthUserId: null,
          sourceConversationId: null,
          property: {
            id: "property-2",
            title: "برج الأعمال",
            address: "شمال الرياض",
            price: 1800000,
            beds: 2,
            baths: 2,
            sqft: 120,
            location: "الرياض",
            area: "العليا",
            imageUrl: null,
          },
          propertyGallery: [],
          propertySummary: null,
          commissionText: null,
          permitStatus: null,
          productStatus: null,
          allowedAudience: "both" as const,
          attachments: [],
          clientContext: null,
          primaryOrganization: {
            id: "broker-1",
            name: "وسيط الرياض",
            type: "broker" as const,
            logoUrl: null,
            website: null,
            contactEmail: null,
          },
          participants: [],
          href: "/ws/offers/offer-2",
          createdAt: 2,
          updatedAt: 5,
        },
      ],
    },
    {
      key: "targeted_shares" as const,
      label: "Targeted Shares",
      description: "Targeted cases you created from your inventory.",
      items: [
        {
          id: "offer-1",
          packageId: "package-1",
          type: "open_offer" as const,
          stage: "open" as const,
          status: "pending" as const,
          publicationState: "published" as const,
          visibility: "public" as const,
          propertyId: "property-1",
          price: 2500000,
          message: "عرض قديم مكرر",
          description: "نسخة أقدم يجب إخفاؤها",
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
            sqft: 190,
            location: "الرياض",
            area: "الملقا",
            imageUrl: "https://images.unsplash.com/photo-offer",
          },
          propertyGallery: [],
          propertySummary: "واجهة قديمة",
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
            logoUrl: "https://example.com/logo.png",
            website: "https://example.com",
            contactEmail: "offers@example.com",
          },
          participants: [],
          href: "/ws/offers/offer-1",
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    },
  ],
  sent: [],
  received: [],
  marketplace: [],
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceOffersZone: vi.fn(() => ({
    getSnapshot,
  })),
}));

import WorkspaceOffersRoute from "./page";

describe("/ws/offers page", () => {
  it("renders one flat deduplicated list ordered by newest update first", async () => {
    const element = await WorkspaceOffersRoute({
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).toContain("العروض");
    expect(markup).toContain("عرض مكرر محدث");
    expect(markup).toContain("عرض ثانٍ");
    expect(getSnapshot).toHaveBeenCalled();
    expect(markup).toContain("مالقا ريزيدنس");
    expect(markup).toContain("عرض مطور مفتوح");
    expect(markup).toContain("offers@example.com");
    expect(markup).toContain("صفحة 1 من 1");
    expect(markup).not.toContain("Open Inventory Offers");
    expect(markup).not.toContain("عرض قديم مكرر");
    expect(markup.indexOf("عرض مكرر محدث")).toBeLessThan(markup.indexOf("عرض ثانٍ"));
  });

  it("ignores the legacy query param and keeps oldest-first sorting", async () => {
    const element = await WorkspaceOffersRoute({
      searchParams: Promise.resolve({ q: "الرياض", sort: "updated_asc" }),
    });
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).not.toContain("نتائج البحث: الرياض");
    expect(markup).toContain("الأقدم أولاً");
    expect(markup).toContain("فلترة سريعة");
    expect(markup).toContain("عرض ثانٍ");
    expect(markup).toContain("عرض مكرر محدث");
    expect(markup.indexOf("عرض ثانٍ")).toBeLessThan(markup.indexOf("عرض مكرر محدث"));
  });

  it("applies structured filters on the root offers page", async () => {
    const element = await WorkspaceOffersRoute({
      searchParams: Promise.resolve({ location: "الرياض", area: "الملقا", bedsMin: "3", budgetMin: "2400000" }),
    });
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).toContain("عرض مكرر محدث");
    expect(markup).not.toContain("عرض ثانٍ");
    expect(markup).toContain("الملقا");
    expect(markup).toContain("الميزانية من");
  });
});

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
  requireWorkspaceData: vi.fn(async () => ({ audience: "developer" })),
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
          message: "عرض تطويري مفتوح",
          description: "عرض مطور مفتوح",
          senderName: "شركة ألف للتطوير",
          recipientAuthUserId: null,
          sourceConversationId: null,
          property: {
            id: "property-1",
            title: "مالقا ريزيدنس",
            address: "الملقا، الرياض",
            imageUrl: "https://images.unsplash.com/photo-offer",
          },
          commissionText: "2.5%",
          permitStatus: "جاهز",
          productStatus: "متاح",
          allowedAudience: "both" as const,
          attachments: [],
          clientContext: null,
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
  it("renders the server-backed offers queues with pagination", async () => {
    const element = await WorkspaceOffersRoute({
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).toContain("العروض كحالات تعاون");
    expect(markup).toContain("عرض مطور مفتوح");
    expect(getSnapshot).toHaveBeenCalled();
    expect(markup).toContain("مالقا ريزيدنس");
    expect(markup).toContain("Open Inventory Offers");
    expect(markup).toContain("صفحة 1 من 1");
  });
});

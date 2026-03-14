import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

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
  sent: [
    {
      id: "offer-1",
      propertyId: "property-1",
      price: 2500000,
      status: "pending" as const,
      visibility: "public" as const,
      message: "عرض تطويري مفتوح",
      description: "عرض مطور مفتوح",
      senderName: "شركة ألف للتطوير",
      property: { id: "property-1", title: "مالقا ريزيدنس", address: "الملقا، الرياض", imageUrl: "https://images.unsplash.com/photo-offer" },
    },
  ],
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
  it("renders the server-backed marketplace overview with pagination", async () => {
    const element = await WorkspaceOffersRoute({
      searchParams: Promise.resolve({}),
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain("عرض تطويري مفتوح");
    expect(getSnapshot).toHaveBeenCalled();
    expect(markup).toContain("مالقا ريزيدنس");
    expect(markup).toContain("صفحة 1 من 1");
  });
});

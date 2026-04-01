import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { WebLocaleProvider } from "@/app/_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({ audience: "broker" })),
}));

const listDeals = vi.fn(async () => [
  {
    id: "deal-1",
    createdAt: 1_700_000_000_000,
    title: "منى الغامدي",
    contactName: "منى الغامدي",
    description: "عميل مهتم",
    stage: "new" as const,
    relationType: "internal_client" as const,
    value: 1800000,
    propertyId: "property-1",
    notes: "لا توجد ملاحظات بعد.",
    project: {
      id: "property-1",
      title: "مالقا ريزيدنس",
      image: "https://images.unsplash.com/photo-crm",
      location: "الملقا، الرياض",
      priceLabel: "1,950,000 ر.س",
      summary: "مشروع جاهز",
    },
  },
]);

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceCrmZone: vi.fn(() => ({
    listDeals,
    updateDealStage: vi.fn(async () => undefined),
    createDeal: vi.fn(async () => "deal-2"),
  })),
}));

import WorkspaceCrmRoute from "./page";

describe("/ws/crm page", () => {
  it("renders the real CRM pipeline projection", async () => {
    const element = await WorkspaceCrmRoute();
    const markup = renderToStaticMarkup(
      <WebLocaleProvider locale="ar" dictionary={getWebDictionary("ar")}>
        {element}
      </WebLocaleProvider>,
    );

    expect(markup).toContain("الصفقات");
    expect(markup).toContain("منى الغامدي");
    expect(markup).toContain("مالقا ريزيدنس");
    expect(listDeals).toHaveBeenCalled();
    expect(markup).not.toContain("<select");
  });
});
